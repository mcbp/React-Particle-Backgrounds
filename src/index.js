import React, { Component } from "react"
import PropTypes from 'prop-types'

class ParticleBackground extends Component {

  constructor(props) {
    super(props)
    this.state = {
      particles: []
    }
    this.canvasRef = React.createRef()
    this.settings = {...ParticleBackground.defaultProps.settings, ...this.props.settings}
    this.updateFrequency = 1000/60
    this.boundCheckSettings()
    console.log(this.settings)
  }

  componentDidMount() {
    console.log("mount")
    this.canvas = this.canvasRef.current
    this.ctx = this.canvasRef.current.getContext('2d')
    this.drawBackground()
    this.generateParticles()
    this.startAnimation()
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      console.log("update")
      this.settings = {...this.settings, ...this.props.settings}
      this.boundCheckSettings()
      let particleChange = this.settings.particleCount - this.state.particles.length
      this.updateParticles(particleChange)
    }
  }

  componentWillUnmount() {
    console.log("unmount")
    if (this.state.animation) cancelAnimationFrame(this.state.animation)
  }

  boundCheckSettings() {
    if (this.settings.maxOpacity > 1 || this.settings.maxOpacity < 0) this.settings.maxOpacity = 1
    if (this.settings.minOpacity < 0 || this.settings.minOpacity > 1) this.settings.minOpacity = 0
    if (this.settings.opacityTransitionTime < 0) this.settings.opacityTransitionTime = 1000
  }

  generateParticles() {
    let canvas = this.canvas
    let particles = []
    for (let i = 0; i < this.settings.particleCount; i++) {
			particles.push(new Particle(i, this.settings, canvas))
		}
    this.setState({particles})
  }

  updateParticles(particleChange) {
    if (particleChange === 0) return
    if (particleChange > 0) {
      this.addParticles(particleChange)
    } else if (particleChange < 0) {
      this.removeParticles(Math.abs(particleChange))
    }
  }

  addParticles(numberToAdd) {
    let canvas = this.canvas
    let newParticles = []
    let currentParticles = this.state.particles
    for (let i = 0; i < numberToAdd; i++) {
      newParticles.push(new Particle(i+currentParticles.length, this.settings, canvas))
    }
    let particles = [...currentParticles, ...newParticles]
    this.setState({particles})
  }

  removeParticles(numberToRemove) {
    let particles = this.state.particles
    particles.splice(-numberToRemove, numberToRemove)
    this.setState({particles})
  }

  startAnimation() {
    let animation = window.requestAnimationFrame(() => this.draw())
    this.setState({animation})
  }

  draw() {
    this.drawBackground()
    this.drawPaticles()
    window.requestAnimationFrame(() => this.draw())
  }

  drawBackground() {
    let canvas = this.canvas
    if (this.settings.canvasFillSpace) {
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
  }

  drawPaticles() {
    let canvas = this.canvas
    let ctx = this.ctx

    for (let i in this.state.particles) {
      let p = this.state.particles[i]
      //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // Direction and speed
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = ctx.canvas.width
  		if (p.x > ctx.canvas.width) p.x = 0
  		if (p.y < 0) p.y = ctx.canvas.height
      if (p.y > ctx.canvas.height) p.y = 0

      // Opacity
      if (this.settings.hasOwnProperty('minOpacity') && this.settings.hasOwnProperty('maxOpacity')) {
        let rate = (this.updateFrequency/this.settings.opacityTransitionTime)*2
        if (p.opacity > p.lastOpacity) {
    			p.lastOpacity = p.opacity
    			p.opacity += rate
    			if (p.opacity > this.settings.maxOpacity)  {
            p.opacity = this.settings.maxOpacity
            p.lastOpacity = 10
          }
    		} else {
    			p.lastOpacity = p.opacity
    			p.opacity -= rate
    			if (p.opacity < this.settings.minOpacity)  {
            p.opacity = this.settings.minOpacity
            p.lastOpacity = -10
          }
    		}
      }

      // Draw
      ctx.beginPath()
  		ctx.fillStyle = this.settings.color
      if (p.hasOwnProperty('opacity')) ctx.globalAlpha = p.opacity
      ctx.arc(p.x, p.y, 30, 0, Math.PI*2)
  		ctx.closePath()
  		ctx.fill()
		}
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        style={this.props.style}
        className={this.props.className}
        width={this.settings.width}
        height={this.settings.height}
      />
    )
  }

}

ParticleBackground.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  settings: PropTypes.shape({
    canvasFillSpace: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string,
    particleCount: PropTypes.number,
    maxSpeed: PropTypes.number,
    minSpeed: PropTypes.number,
    maxOpacity: PropTypes.number,
    minOpacity: PropTypes.number,
    opacityTransitionTime: PropTypes.number
  })
}

ParticleBackground.defaultProps = {
  settings: {
    canvasFillSpace: true,
    width: 200,
    height: 200,
    color: '#ff8c69',
    particleCount: 10,
    maxSpeed: 2,
    minSpeed: 0.5,
    opacityTransitionTime: 3000
  }
}

export default ParticleBackground

class Particle {

	constructor(particleIndex, settings, canvas) {

		this.id = particleIndex;
    this.x = this.getRandomInRange(0, canvas.width)
    this.y = this.getRandomInRange(0, canvas.height)

    // Direction and speed
    this.vx = this.vy = 0
    this.vx = Math.random() < 0.5 ?
              this.getRandomInRange(settings.minSpeed, settings.maxSpeed) :
              this.getRandomInRange(-settings.minSpeed, -settings.maxSpeed)
    this.vy = Math.random() < 0.5 ?
              this.getRandomInRange(settings.minSpeed, settings.maxSpeed) :
              this.getRandomInRange(-settings.minSpeed, -settings.maxSpeed)

    // Opacity
    if (settings.hasOwnProperty('minOpacity') && settings.hasOwnProperty('maxOpacity')) {
      this.opacity = this.getRandomInRange(settings.minOpacity, settings.maxOpacity)
      this.lastOpacity = this.opacity + this.getRandomInRange(-1, 1)
    } else if (settings.hasOwnProperty('minOpacity')) {
      this.opacity = settings.minOpacity
    } else if (settings.hasOwnProperty('maxOpacity')) {
      this.opacity = settings.maxOpacity
    }

		return this
	}

	getRandomInRange(min, max) {
		return (Math.random() * (max - min) + min)
	}

}

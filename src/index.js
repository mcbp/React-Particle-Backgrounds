import React, { Component } from "react"
import PropTypes from 'prop-types'

class ParticleBackground extends Component {

  constructor(props) {
    super(props)
    this.state = {
      particles: []
    }
    this.canvasRef = React.createRef()
    this.settings = {}
    this.settings.canvas = {...ParticleBackground.defaultProps.settings.canvas, ...this.props.settings.canvas}
    this.settings.particle = {...ParticleBackground.defaultProps.settings.particle, ...this.props.settings.particle}
    this.settings.speed = {...ParticleBackground.defaultProps.settings.speed, ...this.props.settings.speed}
    this.settings.opacity = {...ParticleBackground.defaultProps.settings.opacity, ...this.props.settings.opacity}
    this.updateFrequency = 1000/60
    this.boundCheckSettings()
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
      this.settings.canvas = {...this.settings.canvas, ...this.props.settings.canvas}
      this.settings.particle = {...this.settings.particle, ...this.props.settings.particle}
      this.settings.speed = {...this.settings.speed, ...this.props.settings.speed}
      this.settings.opacity = {...this.settings.opacity, ...this.props.settings.opacity}
      this.boundCheckSettings()
      let particleChange = this.settings.particle.particleCount - this.state.particles.length
      this.updateParticles(particleChange)
    }
  }

  componentWillUnmount() {
    console.log("unmount")
    if (this.state.animation) cancelAnimationFrame(this.state.animation)
  }

  boundCheckSettings() {
    if (this.settings.opacity.maxOpacity > 1 || this.settings.opacity.maxOpacity < 0) this.settings.opacity.maxOpacity = 1
    if (this.settings.opacity.minOpacity < 0 || this.settings.opacity.minOpacity > 1) this.settings.opacity.minOpacity = 0
    if (this.settings.opacity.opacityTransitionTime < 0) this.settings.opacity.opacityTransitionTime = 1000
  }

  generateParticles() {
    let canvas = this.canvas
    let particles = []
    for (let i = 0; i < this.settings.particle.particleCount; i++) {
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
    if (this.settings.canvas.canvasFillSpace) {
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

      // Direction and speed
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = ctx.canvas.width
  		if (p.x > ctx.canvas.width) p.x = 0
  		if (p.y < 0) p.y = ctx.canvas.height
      if (p.y > ctx.canvas.height) p.y = 0

      // Opacity
      let opacity = this.settings.opacity
      if (opacity.hasOwnProperty('minOpacity') && opacity.hasOwnProperty('maxOpacity')) {
        let rate = (this.updateFrequency/opacity.opacityTransitionTime)*2
        if (p.opacity > p.lastOpacity) {
    			p.lastOpacity = p.opacity
    			p.opacity += rate
    			if (p.opacity > opacity.maxOpacity)  {
            p.opacity = opacity.maxOpacity
            p.lastOpacity = 10
          }
    		} else {
    			p.lastOpacity = p.opacity
    			p.opacity -= rate
    			if (p.opacity < opacity.minOpacity)  {
            p.opacity = opacity.minOpacity
            p.lastOpacity = -10
          }
    		}
      }

      // Draw
      ctx.beginPath()
  		ctx.fillStyle = this.settings.particle.color
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
        width={this.settings.canvas.width}
        height={this.settings.canvas.height}
      />
    )
  }

}

ParticleBackground.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  settings: PropTypes.shape({
    canvas: {
      canvasFillSpace: PropTypes.bool,
      width: PropTypes.number,
      height: PropTypes.number,
    },
    particle: {
      particleCount: PropTypes.number,
      color: PropTypes.string
    },
    speed: {
      minSpeed: PropTypes.number,
      maxSpeed: PropTypes.number
    },
    opacity: {
      minOpacity: PropTypes.number,
      maxOpacity: PropTypes.number,
      opacityTransitionTime: PropTypes.number
    }
  })
}

ParticleBackground.defaultProps = {
  settings: {
    canvas: {
      canvasFillSpace: true,
      width: 200,
      height: 200
    },
    particle: {
      color: '#ff8c69',
      particleCount: 10
    },
    speed: {
      minSpeed: 0.5,
      maxSpeed: 2
    },
    opacity: {
      opacityTransitionTime: 3000
    }
  }
}

export default ParticleBackground

class Particle {

	constructor(particleIndex, settings, canvas) {

		this.id = particleIndex;
    this.x = this.getRandomInRange(0, canvas.width)
    this.y = this.getRandomInRange(0, canvas.height)

    // Direction and speed
    let speed = settings.speed
    this.vx = this.vy = 0
    this.vx = Math.random() < 0.5 ?
              this.getRandomInRange(speed.minSpeed, speed.maxSpeed) :
              this.getRandomInRange(-speed.minSpeed, -speed.maxSpeed)
    this.vy = Math.random() < 0.5 ?
              this.getRandomInRange(speed.minSpeed, speed.maxSpeed) :
              this.getRandomInRange(-speed.minSpeed, -speed.maxSpeed)

    // Opacity
    let opacity = settings.opacity
    if (opacity.hasOwnProperty('minOpacity') && opacity.hasOwnProperty('maxOpacity')) {
      this.opacity = this.getRandomInRange(opacity.minOpacity, opacity.maxOpacity)
      this.lastOpacity = this.opacity + this.getRandomInRange(-1, 1)
    } else if (opacity.hasOwnProperty('minOpacity')) {
      this.opacity = opacity.minOpacity
    } else if (opacity.hasOwnProperty('maxOpacity')) {
      this.opacity = opacity.maxOpacity
    }

		return this
	}

	getRandomInRange(min, max) {
		return (Math.random() * (max - min) + min)
	}

}

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
    this.settings.velocity = {...ParticleBackground.defaultProps.settings.velocity, ...this.props.settings.velocity}
    this.settings.opacity = {...ParticleBackground.defaultProps.settings.opacity, ...this.props.settings.opacity}
    this.updateFrequency = 1000/60
    this.boundCheckSettings()
  }

  componentDidMount() {
    this.canvas = this.canvasRef.current
    this.ctx = this.canvasRef.current.getContext('2d')
    this.drawBackground()
    this.generateParticles()
    this.startAnimation()
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.settings.canvas = {...this.settings.canvas, ...this.props.settings.canvas}
      this.settings.particle = {...this.settings.particle, ...this.props.settings.particle}
      this.settings.velocity = {...this.settings.velocity, ...this.props.settings.velocity}
      this.settings.opacity = {...this.settings.opacity, ...this.props.settings.opacity}
      this.boundCheckSettings()
      let particleChange = this.settings.particle.particleCount - this.state.particles.length
      this.updateParticles(particleChange)
    }
  }

  componentWillUnmount() {
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
      if (this.settings.canvas.useBouncyWalls) {
        if (p.x - p.size < 0 || p.x + p.size > ctx.canvas.width) p.vx *= -1
        if (p.y - p.size < 0 || p.y + p.size > ctx.canvas.height) p.vy *= -1
        if (p.x - p.size < 0 && p.vx < 0 || p.x + p.size > ctx.canvas.width && p.vx > 0 ) p.x = p.getRandomInRange(p.size, ctx.canvas.width-p.size)
        if (p.y - p.size < 0 && p.vy < 0 || p.y + p.size > ctx.canvas.height && p.vy > 0) p.y = p.getRandomInRange(p.size, ctx.canvas.height-p.size)
      } else {
        if (p.x + p.size < 0) p.x = ctx.canvas.width + p.size
    		if (p.x - p.size > ctx.canvas.width) p.x = -p.size
    		if (p.y + p.size < 0) p.y = ctx.canvas.height + p.size
        if (p.y - p.size > ctx.canvas.height) p.y = -p.size
      }
      p.x += p.vx
      p.y += p.vy

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
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
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
      useBouncyWalls: PropTypes.bool
    },
    particle: {
      particleCount: PropTypes.number,
      color: PropTypes.string,
      minSize: PropTypes.number,
      maxSize: PropTypes.number
    },
    velocity: {
      directionAngle: PropTypes.number,
      directionAngleVariance: PropTypes.number,
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
      height: 200,
      useBouncyWalls: false
    },
    particle: {
      color: '#94ecbe',
      particleCount: 50,
      maxSize: 5
    },
    velocity: {
      maxSpeed: 1
    },
    opacity: {
      opacityTransitionTime: 3000,
      maxOpacity: 1
    }
  }
}

export default ParticleBackground

class Particle {

	constructor(particleIndex, settings, canvas) {
		this.id = particleIndex;

    // Direction
    let velocity = settings.velocity
    if (velocity.hasOwnProperty('directionAngle')) {
      if (velocity.hasOwnProperty('directionAngleVariance')) {
        let angle = this.getRandomInRange(velocity.directionAngle-velocity.directionAngleVariance, velocity.directionAngle+velocity.directionAngleVariance)
        this.vx = this.getCos(angle-90)
        this.vy = this.getSin(angle-90)
      } else {
        this.vx = this.getCos(velocity.directionAngle-90)
        this.vy = this.getSin(velocity.directionAngle-90)
      }
    } else {
      let angle = this.getRandomInRange(0, 360)
      this.vx = this.getCos(angle-90)
      this.vy = this.getSin(angle-90)
    }

    // Speed
    if (velocity.hasOwnProperty('minSpeed') && velocity.hasOwnProperty('maxSpeed')) {
      let speedAdjust = this.getRandomInRange(velocity.minSpeed, velocity.maxSpeed)
      this.vx *= speedAdjust
      this.vy *= speedAdjust
    } else {
      this.vx *= velocity.maxSpeed
      this.vy *= velocity.maxSpeed
    }

    // Size
    let particle = settings.particle
    if (particle.hasOwnProperty('minSize') && particle.hasOwnProperty('maxSize')) {
      this.size = this.getRandomInRange(particle.minSize, particle.maxSize)
    } else {
      this.size = particle.maxSize
    }

    // Opacity
    let opacity = settings.opacity
    if (opacity.hasOwnProperty('minOpacity') && opacity.hasOwnProperty('maxOpacity')) {
      this.opacity = this.getRandomInRange(opacity.minOpacity, opacity.maxOpacity)
      this.lastOpacity = this.opacity + this.getRandomInRange(-1, 1)
    } else {
      this.opacity = opacity.maxOpacity
    }

    // Position
    this.x = this.getRandomInRange(this.size, canvas.width-this.size)
    this.y = this.getRandomInRange(this.size, canvas.height-this.size)

		return this
	}

  toRadians(angle) {
    return angle * (Math.PI / 180)
  }

  getSin(angle) {
    return Math.round(Math.sin(this.toRadians(angle))*10000+Number.EPSILON)/10000
  }

  getCos(angle) {
    return Math.round(Math.cos(this.toRadians(angle))*10000+Number.EPSILON)/10000
  }

	getRandomInRange(min, max) {
		return (Math.random() * (max - min) + min)
	}

}

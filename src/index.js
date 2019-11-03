import React, { Component } from "react"
import PropTypes from 'prop-types'

class ParticleBackground extends Component {

  constructor(props) {
    super(props)
    this.state = {
      particles: {}
    }
    this.canvasRef = React.createRef()
    this.settings = {...ParticleBackground.defaultProps.settings, ...this.props.settings}
  }

  componentDidMount() {
    console.log("mount")
    const canvas = this.canvasRef.current
    const ctx = canvas.getContext('2d')
    this.drawBackground(canvas, ctx)
    this.generateParticles(canvas)
    this.startAnimation(canvas, ctx)
  }

  componentWillUnmount() {
    console.log("unmount")
    clearInterval(this.state.intervalId)
  }

  generateParticles(canvas) {
    let particles = {}
    for (let i = 0; i < this.settings.density; i++) {
			particles[i] = new Particle(i, this.settings, canvas)
		}
    this.setState({particles})
  }

  startAnimation(canvas, ctx) {
    let _this = this
    let intervalId = setInterval(() => {
      this.drawBackground(canvas, ctx)
      this.drawPaticles(canvas, ctx)
    }, 30)
    this.setState({intervalId})
  }

  drawBackground(canvas, ctx) {
    if (this.settings.canvasFillSpace) {
      canvas.style.width = "100%"
		  canvas.style.height = "100%"
		  canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
  }

  drawPaticles(canvas, ctx) {

    for (let i in this.state.particles) {
      let p = this.state.particles[i]

      console.log("draw")
      ctx.beginPath()
  		ctx.fillStyle = "rgba(0, 0, 0, 1)"
  		ctx.arc(p.x, p.y, 2, 0, Math.PI*2)
  		ctx.closePath()
  		ctx.fill()
		}
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        style={{...ParticleBackground.defaultProps.style, ...this.props.style}}
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
    density: PropTypes.number,
    maxSpeed: PropTypes.number,
    minSpeed: PropTypes.number
  })
}

ParticleBackground.defaultProps = {
  style: {
    backgroundColor: 'pink'
  },
  settings: {
    canvasFillSpace: true,
    width: 200,
    height: 200,
    density: 10,
    maxSpeed: 10,
    minSpeed: 1
  }
}

export default ParticleBackground

class Particle {

	constructor(particleIndex, settings, canvas) {

		this.id = particleIndex;
    this.x = this.getRandomInRange(0, canvas.width)
    this.y = this.getRandomInRange(0, canvas.height)

		return this
	}

	getRandomInRange(min, max) {
		return (Math.random() * (max - min) + min)
	}

}

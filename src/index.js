import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';

const ParticleBackground = props => {

  const defaults = {
    canvas: {
      canvasFillSpace: true,
      width: 200,
      height: 200,
      useBouncyWalls: false
    },
    particle: {
      color: '#94ecbe',
      particleCount: 1,
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

  const [particles, setParticles] = useState([]);
  const [animation, setAnimation] = useState(null);

  const { settings } = props;
  const [settingsWithDefaults, setSettingsWithDefaults] = useState(merge(defaults, settings));
  console.log(settingsWithDefaults);

  const updateFrequency = 1000/60;

  const canvasRef = useRef(null);
  const isFirstRender = useRef(true);
  const animRef = useRef(null);

  // Init
  useEffect(() => {
    let ctx = canvasRef.current.getContext('2d');
    boundCheckSettings();
    drawBackground();
    generateParticles();
  }, []);

  // Ensure animation starts after particles generated and stops when unmounted
  useEffect(() => {
    //if (!animation && particles.length > 0) {
    if (!animRef.current && particles.length > 0) {
      startAnimation();
    }
    return () => {
      if (animRef.current) window.cancelAnimationFrame(animation);
    }
  }, [particles, animation])

  // watch settings and apply appropriate updates
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setSettingsWithDefaults(merge(settingsWithDefaults, settings));
      boundCheckSettings();
      let particleChange = settingsWithDefaults.particle.particleCount - particles.length;
      updateParticles(particleChange)
    }
  }, [settings]);

  // Restart anim if particles change
  useEffect(() => {
    window.cancelAnimationFrame(animRef.current);
    startAnimation();
  }, [particles])

  const boundCheckSettings = () => {
    if (settingsWithDefaults.opacity.maxOpacity > 1 || settingsWithDefaults.opacity.maxOpacity < 0) settingsWithDefaults.opacity.maxOpacity = 1
    if (settingsWithDefaults.opacity.minOpacity < 0 || settingsWithDefaults.opacity.minOpacity > 1) settingsWithDefaults.opacity.minOpacity = 0
    if (settingsWithDefaults.opacity.opacityTransitionTime < 0) settingsWithDefaults.opacity.opacityTransitionTime = 1000
  }

  const generateParticles = () => {
    let canvas = canvasRef.current;
    let newParticles = [];
    for (let i = 0; i < settingsWithDefaults.particle.particleCount; i++) {
			newParticles.push(new Particle(i, settingsWithDefaults, canvas));
		}
    setParticles(newParticles);
  }

  const updateParticles = (particleChange) => {
    if (particleChange === 0) return;
    if (particleChange > 0) {
      addParticles(particleChange);
    } else if (particleChange < 0) {
      removeParticles(Math.abs(particleChange));
    }
  }

  const addParticles = (numberToAdd) => {
    let canvas = canvasRef.current;
    let newParticles = [];
    let currentParticles = particles;
    for (let i = 0; i < numberToAdd; i++) {
      newParticles.push(new Particle(i+currentParticles.length, settingsWithDefaults, canvas));
    }
    let updatedParticles = [...currentParticles, ...newParticles];
    setParticles(updatedParticles);
  }

  const removeParticles = (numberToRemove) => {
    let reducedParticles = particles;
    reducedParticles.splice(-numberToRemove, numberToRemove)
    setParticles(reducedParticles);
  }

  const startAnimation = () => {
    draw();
  }

  const draw = () => {
    drawBackground();
    drawParticles();
    animRef.current = window.requestAnimationFrame(() => draw());
  }

  const drawBackground = () => {
    let canvas = canvasRef.current;
    if (settingsWithDefaults.canvas.canvasFillSpace) {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }

  const drawParticles = () => {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext('2d');

    for (let i in particles) {
      let p = particles[i];

      // Direction and speed
      if (settingsWithDefaults.canvas.useBouncyWalls) {
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
      p.x += p.vx;
      p.y += p.vy;

      // Opacity
      let opacity = settingsWithDefaults.opacity
      if (opacity.hasOwnProperty('minOpacity') && opacity.hasOwnProperty('maxOpacity')) {
        let rate = (updateFrequency/opacity.opacityTransitionTime)*2
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
      ctx.beginPath();
  		ctx.fillStyle = settingsWithDefaults.particle.color;
      if (p.hasOwnProperty('opacity')) ctx.globalAlpha = p.opacity;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
  		ctx.closePath();
  		ctx.fill();
		}
  }

  return (
    <canvas
      ref={canvasRef}
      style={props.style}
      className={props.className}
      width={settingsWithDefaults.canvas.width}
      height={settingsWithDefaults.canvas.height}
    />
  )

}

ParticleBackground.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  settings: PropTypes.shape({
    canvas: PropTypes.shape({
      canvasFillSpace: PropTypes.bool,
      width: PropTypes.number,
      height: PropTypes.number,
      useBouncyWalls: PropTypes.bool
    }),
    particle: PropTypes.shape({
      particleCount: PropTypes.number,
      color: PropTypes.string,
      minSize: PropTypes.number,
      maxSize: PropTypes.number
    }),
    velocity: PropTypes.shape({
      directionAngle: PropTypes.number,
      directionAngleVariance: PropTypes.number,
      minSpeed: PropTypes.number,
      maxSpeed: PropTypes.number
    }),
    opacity: PropTypes.shape({
      minOpacity: PropTypes.number,
      maxOpacity: PropTypes.number,
      opacityTransitionTime: PropTypes.number
    })
  })
}

export default ParticleBackground;

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
  
export const merge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
  }
  Object.assign(target || {}, source)
  return target
}

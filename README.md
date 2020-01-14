# React-Particle-Backgrounds
Simple and customisable animated particle backgrounds for React

## Demo
https://mcbp.github.io/React-Particle-Backgrounds-Demo

## Install
```
npm install --save react-particle-backgrounds
```

## Basic Example

The `<ParticleBackground />` component takes only one prop: `settings`.

It is defined as an object with specific shape, this is detailed below in the example code.

```javascript
import React from 'react'
import ParticleBackground from 'react-particle-backgrounds'

const App = () => {

  const settings = {
    canvas: {
      canvasFillSpace: true,
      width: 200,
      height: 200,
      useBouncyWalls: false
    },
    particle: {
      particleCount: 50,
      color: '#94ecbe',
      minSize: 2,
      maxSize: 5
    },
    velocity: {
      directionAngle: 0,
      directionAngleVariance: 360,
      minSpeed: 1,
      maxSpeed: 3
    },
    opacity: {
      minOpacity: 0,
      maxOpacity: 0.5,
      opacityTransitionTime: 3000
    }
  }

  return <ParticleBackground settings={settings} />

}

export default App
```

## Prop Types

The accepted prop types and their default values are listed below

Property | Type | Default Value | Description
--- | --- | --- | ---
canvasFillSpace | Boolean | `true` | Determines if the component will fill the width and height of it's parent container.
width | Number | `200` | Width of component in px, `canvasFillSpace` set to true will override this value.
height | Number | `200` | Height of component in px, `canvasFillSpace` set to true will override this value.
useBouncyWalls | Boolean | `false` | Controls whether particles pass through walls and out the other side, or bounce off the borders.
particleCount | Number | `50` | Number of particles rendered.
color | String | `'#94ecbe'` | Color of the particles, must be either hex or rgb.
minSize | Number | `null` | Smallest possible size for each particle. When set to null all particles will be drawn at `maxSize`.
maxSize | Number | `5` | Largest possible size for each particle.
directionAngle | Number | 0 | Direction of travel of particles in degrees, 0 being upwards.
directionAngleVariance | Number | 180 | Defines a range for directionAngle. Maximum angle being `directionAngle + directionAngleVariance` and minimum being `directionAngle - directionAngleVariance`.
minSpeed | Number | `null` | Smallest possible speed for each particle. When set to null all particles will be set to the value of `maxSpeed`.
maxSpeed | Number | `1` | Largest possible speed for each particle.
minOpacity | Number | `null` | Lowest possible opacity for each particle. When set to null all particles will be drawn at the value of `maxOpacity`.
maxOpacity | Number | `1` | Largest possible opacity for each particle.
opacityTransitionTime | Number | `3000` | Time in ms for particles to transition from `minOpacity` to `maxOpacity`.

## License

MIT


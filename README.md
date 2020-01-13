# React-Particle-Backgrounds
Simple and customisable animated particle backgrounds for React

## Demo
https://mcbp.github.io/React-Particle-Backgrounds-Demo

## Install
```
npm install --save react-particle-backgrounds
```

## Basic Example

The `<ParticleBackground />` component takes only one prop `settings`.

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

Property | PropType | Default Value
--- | --- | ---
canvasFillSpace | Boolean | `true`
width | Number | `200`
height | Number | `200`
useBouncyWalls | Boolean | `false`
particleCount | Number | `50`
color | String | `'#94ecbe'`
minSize | Number | `null`
maxSize | Number | `5`
directionAngle | Number | `null`
directionAngleVariance | Number | `null`
minSpeed | Number | `null`
maxSpeed | Number | `1`
minOpacity | Number | `null`
maxOpacity | Number | `1`
opacityTransitionTime | Number | `3000`

## License

MIT


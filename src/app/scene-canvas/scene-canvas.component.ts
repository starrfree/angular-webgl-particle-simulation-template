import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ShaderService } from '../shader.service';

@Component({
  selector: 'app-scene-canvas',
  templateUrl: './scene-canvas.component.html',
  styleUrls: ['./scene-canvas.component.css']
})
export class SceneCanvasComponent implements OnInit {
  @ViewChild('glCanvas') public canvas!: ElementRef
  didInit: boolean = false
  buffers: any
  textures: any
  particleTextureSize: [number, number] = [40, 30]
  get particleCount() {
    return this.particleTextureSize[0] * this.particleTextureSize[1]
  }

  constructor(private shaderService: ShaderService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.shaderService.getShaders().then(() => {
      this.didInit = true
      this.main()
    })
  }

  main() {
    const gl = this.canvas.nativeElement.getContext("webgl2")
    this.shaderService.gl = gl
    gl.getExtension("EXT_color_buffer_float")
    if (gl === null) {
      console.error("Unable to initialize WebGL")
      alert("Unable to initialize WebGL. Your browser or machine may not support it.")
      return
    }
    this.buffers = this.initBuffers(gl)
    this.textures = this.initTextures(gl)
    const shaderProgram = this.shaderService.initShaderProgram(gl, this.shaderService.vertexSource, this.shaderService.fragmentSource)
    const programInfo = {
      update: {

      },
      draw: {
        program: shaderProgram,
        uniformLocations: {
          width: gl.getUniformLocation(shaderProgram, 'u_Width'),
          height: gl.getUniformLocation(shaderProgram, 'u_Height'),
          positionTexture: gl.getUniformLocation(shaderProgram, 'positionSampler'),
          velocityTexture: gl.getUniformLocation(shaderProgram, 'velocitySampler'),
        },
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'i_VertexPosition')
        }
      },
    }
    const resizeCanvas = () => {
      this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth
      this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      this.drawScene(gl, programInfo)
    }
    resizeCanvas()
    var render = () => {
      this.drawScene(gl, programInfo)
      // requestAnimationFrame(render)
    }
    render()
  }

  initBuffers(gl: WebGL2RenderingContext) {
    var corners: number[] = [
       1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
      -1.0, -1.0
    ]
    const cornersBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cornersBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    var positions: number[] = []
    var dx = 1.0 / this.particleTextureSize[0]
    var dy = 1.0 / this.particleTextureSize[1]
    for(var i = 0; i < this.particleTextureSize[0]; i++) {
      for(var j = 0; j < this.particleTextureSize[1]; j++) {
        const x = (i + 0.01) * dx
        const y = (j + 0.01) * dy
        positions.push(x)
        positions.push(y)
      }
    }
    const particlesBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, particlesBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return {
      corners: cornersBuffer,
      particles: particlesBuffer
    }
  }

  initTextures(gl: WebGL2RenderingContext) {
    var positions: number[] = []
    var velocities: number[] = []
    var dx = 1.0 / this.particleTextureSize[0]
    var dy = 1.0 / this.particleTextureSize[1]
    for(var i = 0; i < this.particleTextureSize[0]; i++) {
      for(var j = 0; j < this.particleTextureSize[1]; j++) {
        const x = i * dx * 2 - 1 + dx
        const y = j * dy * 2 - 1 + dy
        positions.push(x)
        positions.push(y)
        var angle: number = Math.random() * 2 * Math.PI
        var v: number = 0.05
        velocities.push(v * Math.cos(angle))
        velocities.push(v * Math.sin(angle))
      }
    }
    var positionTexture = this.shaderService.textureFromPixelArray(gl, positions, gl.RG, this.particleTextureSize[0], this.particleTextureSize[1])
    var velocityTexture = this.shaderService.textureFromPixelArray(gl, velocities, gl.RG, this.particleTextureSize[0], this.particleTextureSize[1])
    return {
      position: positionTexture,
      velocity: velocityTexture
    }
  }

  drawScene(gl: WebGL2RenderingContext, programInfo: any) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(programInfo.draw.program)
    gl.uniform1f(programInfo.draw.uniformLocations.width, gl.canvas.width)
    gl.uniform1f(programInfo.draw.uniformLocations.height, gl.canvas.height)
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.position);
    gl.uniform1i(programInfo.draw.uniformLocations.positionTexture, 0);

    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.velocity);
    gl.uniform1i(programInfo.draw.uniformLocations.velocityTexture, 1);
    
    {
      const numComponents = 2
      const type = gl.FLOAT
      const normalize = false
      const stride = 0
      const offset = 0
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.particles)
      gl.vertexAttribPointer(
        programInfo.draw.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset)
      gl.enableVertexAttribArray(programInfo.draw.attribLocations.vertexPosition)
    }
    gl.drawArrays(gl.POINTS, 0, this.particleCount)
  }
}

// TEST FRAG
// {
//   const numComponents = 2
//   const type = gl.FLOAT
//   const normalize = false
//   const stride = 0
//   const offset = 0
//   gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.corners)
//   gl.vertexAttribPointer(
//     programInfo.draw.attribLocations.vertexPosition,
//     numComponents,
//     type,
//     normalize,
//     stride,
//     offset)
//   gl.enableVertexAttribArray(programInfo.draw.attribLocations.vertexPosition)
// }
// gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
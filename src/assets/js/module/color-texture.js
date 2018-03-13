class ColorTex{
  constructor(webgl){
    this.webgl = webgl;
    this.controls = this.webgl.controls;
    this.size = this.webgl.size;

    this.colorPallete = [];

    const _colorPallete = this.controls.props.pallete;


    for(let i = 0; i < _colorPallete.length; i++){
      this.colorPallete[i] = new THREE.Color(_colorPallete[i]);
    }

    this.objType = [
      new THREE.TorusBufferGeometry(8, 4, 18, 32),
      new THREE.TorusBufferGeometry(14, 3, 5, 3),
      new THREE.BoxBufferGeometry(12, 12, 12),
      new THREE.TorusBufferGeometry(16, 2, 5, 6),
    ];

    this.objTypeName = [
      'ring', 'triangle', 'box', 'hexagon'
    ];

    this.objNum = 0
    this.init();
  }

  init(){
    this.width = this.webgl.width;
    this.height = this.webgl.height;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, .01, 10000 );
    this.scene.add( this.camera );
    this.camera.position.set(-1, 3, 1);
    this.camera.lookAt(this.scene.position);

    var renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    };

    this.fbo = new THREE.WebGLRenderTarget( this.width, this.height, renderTargetParameters );
    this.fbo.texture.format = THREE.RGBAFormat;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.orbitControls = new THREE.OrbitControls( this.camera, this.webgl.renderer.domElement );

    this.sim = new Simulation(this.webgl, this.size);

    var scale = {
      x: 1, 
      y: 1,
      z: 1
    }

    this.material = new THREE.ShaderMaterial( {
      uniforms: {
        posMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.pos).texture },
        velMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.vel).texture },
        uSize: { type: "f", value: this.sim.size },
        uTick: { type: 'f', value: 0 },
        uScale2: { type: 'v3', value: new THREE.Vector3(scale.x, scale.y, scale.z) },
        uScale1: { type: 'f', value: 0.7 },
        uColorArray: {type: "v3v", value: this.colorPallete},
        isEdge: {type: 'i', value: true},
        uEdgeScale: {type: 'f', value: this.controls.props.edgeSize},
        uEdgeColor: {type: 'vec3', value: new THREE.Color(this.controls.props.edgeColor)},
        isShading: {type: 'i', value: this.controls.props.shading}
      },

      vertexShader: this.webgl.vertShader[1],
      fragmentShader: this.webgl.fragShader[4],
      side: THREE.DoubleSide,
      flatShading: true,
      transparent: true,
    });

    for(let i = 0; i < this.objType.length; i++){
      var originalG = this.objType[i];
      var edgesOriginalG = new THREE.EdgesGeometry(originalG);
      var EdgeVertices = edgesOriginalG.attributes.position.array;

      const posOrder = this.calcSameVert(originalG);
      originalG = this.calcVertNormal(originalG, posOrder, EdgeVertices);

      var mesh = this.createObj(originalG);

      this.objType[i] = mesh;
    }
  };


  calcVertNormal(originalG, posOrder, edgeVertices){
    const length = posOrder.array.length;
    const vertNormal = [];
    const faceNormal = originalG.attributes.normal.array;
    const originalVertices = originalG.attributes.position.array;

    for(let i = 0; i <= posOrder.maxCount; i++){
      const orderNumArray = [];
      const normalSum = {x: 0, y: 0, z: 0};
      var count = 0;

      for(let j = 0; j < length; j++){
        if(posOrder.array[j] === i){
          var pos = {
            x: originalVertices[j * 3 + 0],
            y: originalVertices[j * 3 + 1],
            z: originalVertices[j * 3 + 2]
          }

          var detectEdge = this.detectEdge(pos, edgeVertices);

          orderNumArray.push(j);

          if(detectEdge){
            normalSum.x += faceNormal[j * 3 + 0];
            normalSum.y += faceNormal[j * 3 + 1];
            normalSum.z += faceNormal[j * 3 + 2];


          } else {
          }

          count++;
        }
      }

      normalSum.x /= count;
      normalSum.y /= count;
      normalSum.z /= count;



      const vecLength = Math.sqrt(normalSum.x * normalSum.x + normalSum.y * normalSum.y + normalSum.z * normalSum.z);

      if(vecLength !== 0){
        normalSum.x /= vecLength;
        normalSum.y /= vecLength;
        normalSum.z /= vecLength;
      }

      for(let k = 0; k < count; k++){
        const num = orderNumArray[k];
        vertNormal[num * 3 + 0] = normalSum.x;
        vertNormal[num * 3 + 1] = normalSum.y;
        vertNormal[num * 3 + 2] = normalSum.z;
      }

    }

    const vertNormals = new THREE.Float32BufferAttribute( vertNormal , 3 );
    originalG.addAttribute("vertNormal", vertNormals);
    return originalG;
  }

  detectEdge(vec3, edgeVertices){
    var isSame = false;
    for(var i = 0, len = edgeVertices.length; i < len; i+=3){
      var edgeVert = {};
      edgeVert.x = edgeVertices[i + 0];
      edgeVert.y = edgeVertices[i + 1];
      edgeVert.z = edgeVertices[i + 2];

      isSame = Math.abs(vec3.x - edgeVert.x) < 0.001  && Math.abs(vec3.y - edgeVert.y) < 0.001 && Math.abs(vec3.z - edgeVert.z) < 0.001;
      if(isSame) break;
    }

    return isSame;
  }


  calcSameVert(geometry){
    this.verticesArray = geometry.attributes.position.array;
    var arrayLength = this.verticesArray.length;
    
    this.vecCount = 0;
    this.indexCount = 0;
    this.vec3Array = [];

    this.vertexArray = [];
    const posOrderArray = [];
    
    for(var i = 0; i < arrayLength; i+= 3){
      var vec3 = {};
      vec3.x = this.verticesArray[i];
      vec3.y = this.verticesArray[i + 1];
      vec3.z = this.verticesArray[i + 2];
      var detect = this.detectVec(vec3);
      
      if(detect === 0 || detect > 0){
        posOrderArray[this.indexCount] = detect;
        
      } else {
        this.vec3Array[this.vecCount] = vec3;
        this.vertexArray.push(vec3.x, vec3.y, vec3.z);

        posOrderArray[this.indexCount] = this.vecCount;
        
        this.vecCount++;
      } 

      this.indexCount++;
    }

    return {array: posOrderArray, maxCount: this.vecCount - 1};
  }

  detectVec(vec3){
    if(this.vecCount === 0) return false;
  
    for(var i = 0, len = this.vec3Array.length; i < len; i++){
      var _vec3 = this.vec3Array[i];
      var isSame = Math.abs(vec3.x - _vec3.x) < 0.001  && Math.abs(vec3.y - _vec3.y) < 0.001 && Math.abs(vec3.z - _vec3.z) < 0.001;
      if(isSame) {
        return i;
      }
    }

    return false;
  };


  createObj(originalG){
    var geometry = new THREE.InstancedBufferGeometry();
    var vertices = originalG.attributes.position.clone();

    geometry.addAttribute("position", vertices);

    var normals = originalG.attributes.normal.clone();
    geometry.addAttribute("normal", normals);

    var vertNormals = originalG.attributes.vertNormal.clone();
    geometry.addAttribute("vertNormal", vertNormals);

      // uv
    var uvs = originalG.attributes.uv.clone();
    geometry.addAttribute("uv", uvs);

      // index
    if(originalG.index){
        var indices = originalG.index.clone();
        geometry.setIndex(indices);
    }


    geometry.maxInstancedCount = this.sim.size * this.sim.size;

    var nums = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);
    var numRatios = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);

    for(var i = 0; i < nums.count; i++){
      nums.setX(i, i);
      numRatios.setX(i, i / (nums.count - 1));
    }


    geometry.addAttribute("aNum", nums);
    geometry.addAttribute("aNumRatio", numRatios);

    

    const mesh = new THREE.Mesh( geometry, this.material );

    mesh.visible = false;
    this.group.add( mesh );

    return mesh;
  };


  render(time, delta){
    this.webgl.renderer.clearTarget(this.fbo);

    var sin = (Math.sin(time) * 0.5 + 0.5) * 0.5;

    const mesh = this.objType[this.objNum];

    this.group.rotation.x += delta * 0.1;
    this.group.rotation.y -= delta * 0.08;


    this.sim.velUniforms.timer.value = time;
    this.sim.velUniforms.delta.value = delta;

    this.sim.gpuCompute.compute();

    mesh.material.uniforms.posMap.value = this.sim.gpuCompute.getCurrentRenderTarget(this.sim.pos).texture;
    mesh.material.uniforms.velMap.value = this.sim.gpuCompute.getCurrentRenderTarget(this.sim.vel).texture;

    // timer
    mesh.material.uniforms.uTick.value = time;

    this.objType[this.objNum].visible = true;

    if(this.webgl.controls.props.backSide){
      mesh.material.uniforms.isEdge.value = true;
      mesh.material.side = THREE.BackSide;
      this.webgl.renderer.render( this.scene, this.camera, this.fbo);
    }
    
    if(this.webgl.controls.props.frontSide){
      mesh.material.uniforms.isEdge.value = false;
      mesh.material.side = THREE.FrontSide;
      this.webgl.renderer.render( this.scene, this.camera, this.fbo);
    }

    

    this.objType[this.objNum].visible = false;
  };

}
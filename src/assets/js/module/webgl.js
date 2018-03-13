class Webgl{
  constructor(){
    this.size = 32;

    this.vertShader = [
      "assets/glsl/output.vert",
      "assets/glsl/cube.vert"
    ];

    this.fragShader = [
      "assets/glsl/output.frag",
      "assets/glsl/simulation_def.frag",
      "assets/glsl/simulation_vel.frag",
      "assets/glsl/simulation_pos.frag",
      "assets/glsl/cube.frag",
    ];


    this.shaderLength = this.vertShader.length + this.fragShader.length;
    this.shaderCount = 0;

    for(var i = 0; i < this.vertShader.length; i++){
      this.importShader_vert(i);
    }

    for(var i = 0; i < this.fragShader.length; i++){
      this.importShader_frag(i);
    }
  }

  importShader_vert(i){

    var myRequest = new XMLHttpRequest();

    var _this = this;
    myRequest.onreadystatechange = () =>{
      if ( myRequest.readyState === 4 ) {
         _this.vertShader[i] = myRequest.response;
        _this.completeShaderLoad();
      }
    };


    myRequest.open("GET", this.vertShader[i], true);
    myRequest.send();
  };


  importShader_frag(i){

    var myRequest = new XMLHttpRequest();
    // ハンドラの登録
    var _this = this;
    myRequest.onreadystatechange = () => {
      if ( myRequest.readyState === 4 ) {
         _this.fragShader[i] = myRequest.response;


        _this.completeShaderLoad();
      }
    };

    myRequest.open("GET", this.fragShader[i], true);
    myRequest.send();
  };



  completeShaderLoad(){
    this.shaderCount++;

    if(this.shaderCount === this.shaderLength) {
      this.isShaderComplete = true;
      this.init();
    }
  };


  init(){
    this.width = 2048;
    this.height = 2048;
    this.aspect = this.width / this.height;
    this.setProps();
    this.container = document.getElementById( "wrapper" );

    this.renderer = new THREE.WebGLRenderer( { 
      antialias: true,
      alpha: true,
    } );

    this.renderer.autoClear = false;
    // renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( ResizeWatch.width, ResizeWatch.height );
    this.renderer.setClearColor( 0xffffff, 0.0 );
    this.container.appendChild( this.renderer.domElement );

    var ratio = (Useragnt.pc) ? 1.0 : 2.0;

    this.renderer.setPixelRatio(ratio);


    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(this.props.fov, this.props.aspect, this.props.near, this.props.far);
    var cameraZ = (this.props.height / 2) / Math.tan((this.props.fov * Math.PI / 180) / 2);
    this.camera.position.set(0, 0, cameraZ);
    this.camera.lookAt(this.scene.position);

    this.controls = new Controls(this);

    this.colorTex = new ColorTex(this);

    this.createPlane();

    this.controls.init();

    
    

    this.time = new THREE.Clock();
    this.render();

    ResizeWatch.register(this);
  };


  setProps(){
    var width = ResizeWatch.width;
    var height = ResizeWatch.height;
    var aspect = width / height;

    this.props = {
      width: width,
      height: height,
      aspect: aspect,
      fov: 45,
      left: -width / 2,
      right: width / 2,
      top: height / 2,
      bottom: -height / 2,
      near: 0.1,
      far: 10000,
      parent: document.getElementById("wrapper")
    };
  };


  createPlane(){
    var g = new THREE.PlaneBufferGeometry(this.width, this.height);

    

    this.uniforms = {
      uTex_1: {type: "t", value: this.colorTex.fbo.texture},
      uTick: {type: "f", value: 0},
      uSize: {type: "v2", value: new THREE.Vector2(this.width, this.height)},
      // uEdgeColor: {type: "v3", value: new THREE.Color(this.edgeColor)},
      uBgColor: {type: "v3", value: new THREE.Color(this.controls.props.bgColor)},
    };

    var m = new THREE.ShaderMaterial({
      vertexShader: this.vertShader[0],
      fragmentShader: this.fragShader[0],
      uniforms: this.uniforms
    });



    var mesh = new THREE.Mesh(g, m);

    mesh.position.z = 10;
    this.scene.add(mesh);

    this.plane = mesh;

    console.log(this.plane);

    if(ResizeWatch.aspect > this.aspect){
      var scale = ResizeWatch.width / this.width;
    } else {
      var scale = ResizeWatch.height / this.height;
    }

    this.plane.scale.x = scale;
    this.plane.scale.y = scale;
  };


  render(){
    var delta = this.time.getDelta() * 5;
    var time = this.time.elapsedTime;

    this.renderer.clear();
    
    this.colorTex.render(time, delta);
    this.uniforms.uTick.value = time;

    this.renderer.render( this.scene, this.camera );

    requestAnimationFrame(this.render.bind(this));
  };


  resizeUpdate(){
    this.setProps();
    this.renderer.setSize(this.props.width, this.props.height);

    this.camera.aspect = this.props.aspect;

    var cameraZ = (this.props.height / 2) / Math.tan((this.props.fov * Math.PI / 180) / 2);

    this.camera.position.set(0, 0, cameraZ);
    this.camera.lookAt(this.scene.position);

    this.camera.updateProjectionMatrix();

    if(ResizeWatch.aspect > this.aspect){
      var scale = ResizeWatch.width / this.width;
    } else {
      var scale = ResizeWatch.height / this.height;
    }

    this.plane.scale.x = scale;
    this.plane.scale.y = scale;
  }

}
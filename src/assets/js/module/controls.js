class Controls{
  constructor(webgl){
    this.webgl = webgl;


    this.props = {
      pallete: [
        '#ffe100',
        '#44dee8',
        '#fa2c98',
        '#ffffff'
      ],
      edgeColor: '#69145a',
      bgColor: '#ff2f6c',
      objType: null,
      backSide: true,
      frontSide: true,
      edgeSize: 0.38,
      shading: true,
    };
  }

  init(){
    this.colorTex = this.webgl.colorTex;
    this.props.objType = this.colorTex.objTypeName[0];
    this.uColorArray = this.colorTex.material.uniforms.uColorArray;

    this.gui = new dat.GUI({width: 300});

    this.gui_objColor = this.gui.addFolder('obj color');
    this.gui_objColor.open();

    this.gui_objColor.addColor(this.props.pallete, 0).name('obj color 1').onChange(this.colorFunc1.bind(this));
    this.gui_objColor.addColor(this.props.pallete, 1).name('obj color 2').onChange(this.colorFunc2.bind(this));
    this.gui_objColor.addColor(this.props.pallete, 2).name('obj color 3').onChange(this.colorFunc3.bind(this));
    this.gui_objColor.addColor(this.props.pallete, 3).name('obj color 4').onChange(this.colorFunc4.bind(this));

    this.gui.addColor(this.props, 'edgeColor').name('edge color').onChange(this.colorFunc_edge.bind(this));
    this.gui.addColor(this.props, 'bgColor').name('bg color').onChange(this.colorFunc_bg.bind(this));

    this.gui.add(this.props, 'objType', this.colorTex.objTypeName).name('obj type').onFinishChange(this.objTypeFunc.bind(this));

    this.gui.add(this.props, 'backSide').name('outline color');
    this.gui.add(this.props, 'frontSide').name('obj color');
    this.gui.add(this.props, 'edgeSize', 0.1, 0.6).name('edge size').onChange(this.edgeSize.bind(this));
    this.gui.add(this.props, 'shading').onChange(this.shading.bind(this));


  }

  colorFunc1(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[0] = color;
  }

  colorFunc2(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[1] = color;
  }

  colorFunc3(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[2] = color;
  }

  colorFunc4(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[3] = color;
  }

  colorFunc_edge(value){
    var color = new THREE.Color(value);
    // this.webgl.uniforms.uEdgeColor.value = color;
    this.colorTex.material.uniforms.uEdgeColor.value = color;
  }

  colorFunc_bg(value){
    var color = new THREE.Color(value);
    this.webgl.uniforms.uBgColor.value = color;
  }

  objTypeFunc(value){
    for(var i = 0, len = this.colorTex.objTypeName.length; i < len; i++){
      if(value === this.colorTex.objTypeName[i]){
        break;
      }
    }

    this.colorTex.objNum = i;
  }

  edgeSize(value){
    this.colorTex.material.uniforms.uEdgeScale.value = value;
  }

  shading(value){
    this.colorTex.material.uniforms.isShading.value = value;
  }
}
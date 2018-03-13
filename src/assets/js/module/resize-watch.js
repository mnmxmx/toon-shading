class ResizeWatch{
  constructor(){
    this.instances = [];

    this.width = this._width = document.body.clientWidth;
    this.height = this._height = window.innerHeight;
    this.aspect = this.width / this.height;


    window.onresize = () => {
      if(this.instances.length === 0) return;

      this.width = document.body.clientWidth;
      this.height = window.innerHeight;
      this.aspect = this.width / this.height;

      for(var i = 0; i < this.instances.length; i++){
        this.instances[i].resizeUpdate();
      }
    }.bind(this)
  }

  register(instance){
    this.instances.push(instance);
  }

}

window.ResizeWatch = new ResizeWatch();
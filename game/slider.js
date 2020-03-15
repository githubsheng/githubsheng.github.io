const speedSlider = document.getElementById("speed-slider");
speedSlider.addEventListener("input", function(){
    _DotGameGlobal.speed.fallSpeed = this.value;
});
function a11yClick(event){
  console.log(event.type, event.charCode, event.keyCode);
  if(event.type === 'click'){
    return true;
  }
  else if(event.type === 'keyup'){
    const code = event.charCode || event.keyCode;
    if((code === 32)|| (code === 13)){
      return true;
    }
  }
  else{
    return false;
  }
}
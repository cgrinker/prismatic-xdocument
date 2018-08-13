
function recurse(parent, data, key) {

  if(data.name === "cgr:DEAD_PATH") {
    delete parent[key];
    return;
  }
  
  if(data.attributes && data.attributes.length === 1 && data.attributes[0].name === "cgr:DEAD_PATH") {
    delete parent[key];
    return;
  }

  if(data.elements && data.elements.length === 1 && data.elements[0].name === "cgr:DEAD_PATH") {
    delete parent[key];
    return;
  }
  
  for(d in data.elements) {
      
    recurse(data.elements, data.elements[d], d);
  }
}


module.exports = (res) => {

    for(d in res.data.elements) {
      recurse(res.data.elements, res.data.elements[d], d);
    }
    res.data.elements = res.data.elements.filter((e ) => {return e})
    return res;
}
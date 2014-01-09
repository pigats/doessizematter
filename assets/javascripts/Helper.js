Helper = {
  
  appendText: function(target_id, string) {
    text_node = document.createTextNode(string);
    document.getElementById(target_id).appendChild(text_node);
  }
  
}
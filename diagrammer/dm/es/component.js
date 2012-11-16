/**
   *  
   */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.component", dm.es.element, {
    'options': {
      'nameTemplate': "Component",
      'aux': "component",
      'droppable': true,
      'acceptdrop': "component",
	  'height': "100px"
    },
    '_update': function() {
        this.options.name = "" + $("#" + this.euid + " .Name" ).html();
       var p = $("#" + this.euid + "_Border").position();
       this.options.pageX = p.left;
       this.options.pageY = p.top;
       this.options.width = $("#" + this.euid + "_Border").width();
       this.options.height = $("#" + this.euid + "_Border").height();
    },
    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-component grElement">\
                        <img src="./images/component.png" style="position:absolute;top:3px;right:17px"></img>\
                        <a id="stereotype" class="editablefield" style="text-align:left;position:relative;top:30%">&laquo;interface&raquo;</a><br>\
                        <a id="name" class="editablefield Name" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a>\
                        </div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    },
    '_init': function() {
      this.options.dropped = null;
      this._setOptions(this.options);
    }
});
//@aspect
})(jQuery, dm);

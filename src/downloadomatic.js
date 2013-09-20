/*
  Downloadomatic: Client Side File Creation

  JavaScript + Flash Library
  
  Version: 1.0

  Shaun Donnelly
  hello@sdonnelly.co.uk


**********
  Please note that this is a fork of
  Downloadify (https://github.com/dcneiner/Downloadify).

  Most of the awesome work you see here is part of that
  original project.

  This fork adds the ability to download using a data URI.

**********

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

(function(){
  Downloadomatic = window.Downloadomatic = {
    queue: {},
    uid: new Date().getTime(), 
    getTextForSave: function(queue){
      var obj = Downloadomatic.queue[queue];
      if(obj) return obj.getData();
      return "";
    },
    getFileNameForSave: function(queue){
      var obj = Downloadomatic.queue[queue];
      if(obj) return obj.getFilename();
      return "";
    },
    getDataTypeForSave: function(queue){
      var obj = Downloadomatic.queue[queue];
      if(obj) return obj.getDataType();
      return "";
    },
    saveComplete: function(queue){
      var obj = Downloadomatic.queue[queue];
      if(obj) obj.complete();
      return true;
    },
    saveCancel: function(queue){
      var obj = Downloadomatic.queue[queue];
      if(obj) obj.cancel();
      return true;
    },
    saveError: function(queue){
      var obj = Downloadomatic.queue[queue];
      if(obj) obj.error();
      return true;
    },
    addToQueue: function(container){
      Downloadomatic.queue[container.queue_name] = container;
    },
    // Concept adapted from: http://tinyurl.com/yzsyfto
    // SWF object runs off of ID's, so this is the good way to get a unique ID
    getUID: function(el){
      if(el.id == "") el.id = 'downloadomatic_' + Downloadomatic.uid++;
      return el.id;
    }
  };
 
  Downloadomatic.create = function( idOrDOM, options ){
    var el = (typeof(idOrDOM) == "string" ? document.getElementById(idOrDOM) : idOrDOM );
    return new Downloadomatic.Container(el, options);
  };
 
  Downloadomatic.Container = function(el, options){
    var base = this;
 
    base.el = el;
    base.enabled = true;
    base.dataCallback = null;
    base.filenameCallback = null;
    base.data = null;
    base.filename = null;
 
     var init = function(){
       base.options = options;

      if( !base.options.append ) base.el.innerHTML = "";
      
      base.flashContainer = document.createElement('span');
      base.el.appendChild(base.flashContainer);
        
      base.queue_name = Downloadomatic.getUID( base.flashContainer );
 
      if( typeof(base.options.filename) === "function" )
         base.filenameCallback = base.options.filename;
      else if (base.options.filename)
        base.filename = base.options.filename;

      if( typeof(base.options.data) === "function" )
        base.dataCallback = base.options.data;
      else if (base.options.data)
        base.data = base.options.data;
        
        
      var flashVars = {
        queue_name: base.queue_name,
        width: base.options.width,
        height: base.options.height
      };
      
      var params = {
        allowScriptAccess: 'always'
      };
      
      var attributes = {
        id: base.flashContainer.id,
        name: base.flashContainer.id
      };
      
      if(base.options.enabled === false) base.enabled = false;
      
      if(base.options.transparent === true) params.wmode = "transparent";
      
      if(base.options.downloadImage) flashVars.downloadImage = base.options.downloadImage;
      
      swfobject.embedSWF(base.options.swf, base.flashContainer.id, base.options.width, base.options.height, "10", null, flashVars, params, attributes );

      Downloadomatic.addToQueue( base );
     };

    base.enable = function(){
      var swf = document.getElementById(base.flashContainer.id);
      swf.setEnabled(true);
      base.enabled = true;
    };
    
    base.disable = function(){
      var swf = document.getElementById(base.flashContainer.id);
      swf.setEnabled(false);
      base.enabled = false;
    };
 
    base.getData = function(){
      if( !base.enabled ) return "";
      if( base.dataCallback ) return base.dataCallback();
      else if (base.data) return base.data;
      else return "";
    };
 
    base.getFilename = function(){
      if( base.filenameCallback ) return base.filenameCallback();
      else if (base.filename) return base.filename;
      else return "";
    };
    
    base.getDataType = function(){
      if (base.options.dataType) return base.options.dataType;
      return "string";
    };
    
    base.complete = function(){
      if( typeof(base.options.onComplete) === "function" ) base.options.onComplete();
    };
    
    base.cancel = function(){
      if( typeof(base.options.onCancel) === "function" ) base.options.onCancel();
    };
    
    base.error = function(){
      if( typeof(base.options.onError) === "function" ) base.options.onError();
    };

    base.loaded = function(){
      if( typeof(base.options.afterFlashInit) === "function" ) base.options.afterFlashInit();
    };
  
    init();

    // afterFlashInit callback.
    base.loaded();
  };
  
  Downloadomatic.defaultOptions = {
    swf: 'src/downloadomatic.swf',
    downloadImage: 'src/download.png',
    width: 100,
    height: 30,
    transparent: true,
    append: false,
    dataType: "string",
    mimeType: "text/plain"
  };
})();

// Support for jQuery
if(typeof(jQuery) != "undefined") {

  (function ($) {

    $.fn.downloadomatic = function(options) {

      return this.each(function () {

        options = $.extend({}, Downloadomatic.defaultOptions, options);

        // Clear the element content.
        $(this).html("");

        // If IE, use flash.
        if (IsMSIE()) {

          // Create instance of downloadomatic.
          var dl = Downloadomatic.create(this, options);

          // Start downloadomatic.
          $(this).data('Downloadomatic', dl);
        }

        // If Safari, add a link to the download
        // with some instructions.
        else if (IsSafari()) {

          // Encode the data.
          var encodedData = encodeURIComponent(options.data);

          // Make it into a data URI.
          var dataURI = "data:" + options.mimeType + "," + encodedData;

          // Create a link for the download.
          var downloadLink = "<a href='" + dataURI + "' target='_blank'";

          // Add the custom class, if one was specified.
          if (options.customButtonClass) {

            downloadLink += " class='" + options.customButtonClass + "'";
          }

          downloadLink += ">Download</a>";
        
          // Add the download link.
          $(this).append(downloadLink);

          // afterSafariInit callback.
          if (options.afterSafariInit) {
            options.afterSafariInit();
          }
        }

        // Start a download.
        else {

          // Encode the data.
          var encodedData = encodeURIComponent(options.data);

          // Make it into a data URI.
          var dataURI = "data:" + options.mimeType + "," + encodedData;

          // Navigate to the data URI, which should prompt a download.
          window.location.href = dataURI;
        }

      });

    };

    function IsMSIE() {

      // Checks for Internet Explorer.

      if (navigator.appName === 'Microsoft Internet Explorer') {
        return true;
      }

      return false;
    }

    function IsSafari() {

      // Checks for Safari.

      if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) { 
        return true;
      }

      return false;
    }

  })(jQuery);

};


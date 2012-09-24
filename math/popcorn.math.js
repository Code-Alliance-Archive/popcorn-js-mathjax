// PLUGIN: Math

(function ( Popcorn ) {

  /**
   * Math Popcorn plug-in
   *
   * Places math equations in an element on the page.  Plugin options include:
   * Options parameter will need a start, end.
   *   Start: Is the time that you want this plug-in to execute
   *   End: Is the time that you want this plug-in to stop executing
   *   Equation: Is the formula that you want to appear in the target
   *   Source: Element ID of the hidden element (e.g. div) that contains the math equation (Alternative to Equation)  
   *   Target: Is the ID of the element where the text should be placed. An empty target
   *           will be placed on top of the media element
   *
   * @param {Object} options
   *
   * Example:
   *  var p = Popcorn('#video')
   *
   *    // Simple formula from div
   *    .math({
   *      start: 5, // seconds
   *      end: 15, // seconds
   *      source: "math_crossproduct",
   *      target: 'mathdiv'
   *     })
   *
   *    // Formula from string
   *    .math({
   *      start: 15, // seconds
   *      end: 20, // seconds
   *      equation: = {n \choose k} p^k (1-p)^{ n-k} \]', // An Identity of Ramujan
   *      target: 'mathdiv'
   *    })
   *
   *    // Subtitle formula
   *    .math({
   *      start: 30, // seconds
   *      end: 40, // seconds
   *      source: 'math_lorenz',
   *     })
   **/

  // Subtitle specific functionality
  function createSubtitleContainer( context, id ) {

    var ctxContainer = context.container = document.createElement( "div" ),
        style = ctxContainer.style,
        media = context.media;

    var updatePosition = function() {
      var position = context.position();
      // the video element must have height and width defined
      style.fontSize = "18px";
      style.width = media.offsetWidth + "px";
      style.top = position.top  + media.offsetHeight - ctxContainer.offsetHeight - 40 + "px";
      style.left = position.left + "px";

      setTimeout( updatePosition, 10 );
    };

    ctxContainer.id = id || "";
    style.position = "absolute";
    style.color = "white";
    style.textShadow = "black 2px 2px 6px";
    style.fontWeight = "bold";
    style.textAlign = "center";

    updatePosition();

    context.media.parentNode.appendChild( ctxContainer );

    return ctxContainer;
  }
  
  Popcorn.plugin( "math", {

    manifest: {
      about: {
        name: "Popcorn Math Plugin",
        version: "0.1",
        author: "@peterdotjs, @korsair"
      },
      options: {
        start: {
          elem: "input",
          type: "number",
          label: "Start"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End"
        },
        equation: {
          elem: "input",
          type: "text",
          label: "Equation",
          "default": "Popcorn.js"
        },
        source: {
          elem: "input",
          type: "text",
          label: "Source",
          "default": "Popcorn.js"
        },
        target: {
          elem: "input",
          type: "text",
          label: "Target"
        }
      }
    },
	
    _setup: function( options ) {

      var target,
          source,
          equation,
          container = options._container = document.createElement( "div" );

      container.style.display = "none";

      if ( options.target ) {
        // Try to use supplied target
        target = Popcorn.dom.find( options.target );
		// Try to use the supplied source
		if( source !== null) {
			source = Popcorn.dom.find( options.source );
		}

        if ( !target ) {
          target = createSubtitleContainer( this, options.target );
        }
        else if ( [ "VIDEO", "AUDIO" ].indexOf( target.nodeName ) > -1 ) {
          target = createSubtitleContainer( this, options.target + "-overlay" );
        }

      } else if ( !this.container ) {
        // Creates a div for all subtitles to use
        target = createSubtitleContainer( this );

      } else {
        // Use subtitle container
        target = this.container;
      }

      // cache reference to actual target container
      options._target = target;

	  if(source !== null ) {
         if(Popcorn.dom.find(options.source) !== null) {
           equation = Popcorn.dom.find(options.source).innerHTML;
         }
	     else {
           console.log("[ERROR] popcorn.math.js - Source id not found: " + options.source)
         }
      }
 	  else if(options.equation !== null){
		equation = options.equation;
	  }
	  else {
	    console.log("[ERROR] popcorn.math.js - No equation or source given.")	
      }
      
      //container.innerHTML = source.innerHTML || "";
      container.innerHTML = equation || "";
      MathJax.Hub.Typeset(container);
	  
	  //var math_id = options.id;
	  
	  //if(math_id){
		//	container.innerHTML = document.getElementById(math_id).innerHTML;
		//	MathJax.Hub.Typeset(container);
	  //}

      target.appendChild( container );

      options.toString = function() {
        // use the default option if it doesn't exist
        return options.math || options._natives.manifest.options.math[ "default" ];
      };
    },

    /**
     * @member math
     * The start function will be executed when the currentTime
     * of the video  reaches the start time provided by the
     * options variable
     */
    start: function( event, options ) {
      options._container.style.display = "inline";
    },

    /**
     * @member math
     * The end function will be executed when the currentTime
     * of the video  reaches the end time provided by the
     * options variable
     */
    end: function( event, options ) {
      options._container.style.display = "none";
    },
    _teardown: function( options ) {
      var target = options._target;
      if ( target ) {
        target.removeChild( options._container );
      }
    }
  });
})( Popcorn );

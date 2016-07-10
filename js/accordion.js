/*!
 * Accordion - jQuery Accordion
 * Panayiotis “pvgr” Velisarakos
 */

;( function( $ ){
  "use strict";

  ( function( $, window, document, undefined ) {
    var pluginName = 'accordion';

    function Plugin( element, options ) {
      this.element = element;
      this._name = pluginName;
      this._defaults = $.fn[ pluginName ].defaults;
      this.settings = $.extend( {}, this._defaults, options );
      this._init();
    }

    $.extend( Plugin.prototype, {
      _init: function() {
        var self = this,
            $el = $( this.element ),
            $headers = $el.find( self.settings.headerElement ),
            $contents = $el.find( self.settings.contentElement );

        // expect at least one HEADER and one CONTENT
        if ( $headers.length < 1 && $contents.length < 1 ) {
          return;
        }

        // add ARIA attributes
        self._addARIA( $el, $headers, $contents );

        // save blocks on root element’s data, to be used later
        $el.data( pluginName + '_headers', $headers )
           .data( pluginName + '_contents', $contents );

        // collapse everything
        self._collapseAll( $el, $headers, $contents );

        // backup any ID set on HEADERS, to put it back on destroy
        $headers.each( function( index ) {
          var $this = $( this );

          $this.data( 'old-id', $this.attr( 'id' ) );
          $this.attr( 'id', 'ac-header_' + index );
          $this.data( 'collapsed', true );
        } );

        $contents.each( function( index ) {
          var $this = $( this );

          // backup any ID set on CONTENTS, to put it back on destroy
          $this.data( 'old-id', $this.attr( 'id' ) );
          $this.attr( 'id', 'ac-panel_' + index );

          // expand CONTENT blocks with an “expanded” class
          if ( $this.hasClass( self.settings.preselected ) ) {
            var $thisHeader = $( $headers[index] );

            self._expand( $el, $thisHeader, $this );
          }
        } );

        // time to call the onInit callback function
        self.settings.onInit.call( $el );

        // attach namespaced click event on HEADER elements
        $headers.on( 'click.accordion', function( e ) {
          // just in case…
          e.preventDefault();

          // save the clicked element and the accociated CONTENT
          var $this = $( this ),
              $targetContent = $contents.eq( $headers.index( $this ) );

          // if the clicked HEADER is “collapsed”
          if ( $this.data( 'collapsed' ) === true ) {
            // collapse every other HEADER
            self._collapseAll( $el, $headers.not( $this ), $contents.not( $targetContent ) );

            // expand this HEADER
            self._expand( $el, $this, $targetContent );
          } else {
            // collapse this
            self._collapse( $el, $this, $targetContent );
          }
        } );
      },

      // collapse everything, adjust ARIA attributes accordingly
      _collapseAll: function( $el, $headers, $contents ) {
        $headers.attr( 'aria-selected', 'false' )
                .attr( 'aria-expanded', 'false' )
                .data( 'collapsed', true );

        $contents.attr( 'aria-hidden', 'true' );
      },

      // collapse a single CONTENT block
      _collapse: function( $el, $header, $content ) {
        $header.attr( 'aria-selected', 'false' )
               .attr( 'aria-expanded', 'false' )
               .data( 'collapsed', true );

        $content.attr( 'aria-hidden', 'true' );

        // call the onCollapse callback function
        this.settings.onCollapse.call( this, $header, $content );
      },

      // expand a CONTENT block
      _expand: function( $el, $header, $content ) {
        $header.attr( 'aria-selected', 'true' )
               .attr( 'aria-expanded', 'true' )
               .data( 'collapsed', false );

        $content.attr( 'aria-hidden', 'false' );

        // call the onExpand callback function
        this.settings.onExpand.call( $el, $header, $content );
      },

      // add ARIA attributes, on _init
      _addARIA: function( $el, $headers, $contents ) {
        $el.attr( 'role', 'tablist' )
           .attr( 'aria-multiselectable', false );

        $headers.each( function( index, el ) {
          $( el ).attr( 'role', 'tab' )
                 .attr( 'aria-controls', 'ac-panel_' + index );
        } );

        $contents.each( function( index, el ) {
          $( el ).attr( 'role', 'tabpanel' )
                 .attr( 'aria-labelledby', 'ac-header_' + index );
        } );
      },

      // remove ARIA attributes, on destroy
      _removeARIA: function( $el, $headers, $contents ) {
        $el.removeAttr( 'role aria-multiselectable' );
        $headers.removeAttr( 'role aria-controls aria-selected aria-expanded' );
        $contents.removeAttr( 'role aria-labelledby aria-hidden' );
      },

      // “public” method, passed as a string to the pluginName method of a jQuery object
      destroy: function() {
        var $el = $( this.element );

        // execute the onDestroy function
        this.settings.onDestroy.call( $el, $el.data( pluginName + '_headers' ), $el.data( pluginName + '_contents' ) );

        // remove ARIA attributes
        this._removeARIA( $el, $el.data( pluginName + '_headers' ), $el.data( pluginName + '_contents' ) );

        // remove classes and ids from HEADERS and CONTENTS
        $el.data( pluginName + '_headers' ).add( $el.data( pluginName + '_contents' ) ).each( function() {
          var $this = $( this );

          // revert any saved ID, otherwise remove the attribute altogether
          if ( $this.data( 'old-id' ) ) {
            $this.attr( 'id', $this.data( 'old-id' ) );
          } else {
            $this.removeAttr( 'id' );
          }

          $this.removeData( 'collapsed old-id' );
        } );

        // remove namespaced click event from HEADERS
        $el.data( pluginName + '_headers' ).off( 'click.accordion' );

        // remove data that were saved on the element on init
        $el.removeData( 'plugin_' + pluginName )
           .removeData( pluginName + '_headers' )
           .removeData( pluginName + '_contents' );
      }
    } );

    $.fn[ pluginName ] = function( options ) {
      // convert an array-like object into a true array…
      var args = $.makeArray( arguments ),

          // … and save all parameters except the first one, to be passed to public functions
          after = args.slice( 1 );

      // preserve chainability
      return this.each( function() {
        var instance = $.data( this, 'plugin_' + pluginName );

        // check whether the plugin has already been initialized on the element
        if ( !instance ) {
          // if not, initialize
          $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
        } else {
          // otherwise check whether a “public” function is called
          if ( typeof options === 'string' && typeof instance[options] === 'function' ) {
            // pass “this” and any parameters
            instance[options].apply( instance, after );
          }
        }
      } );
    };

    $.fn[ pluginName ].defaults = {
      // selector for the elements to attach events to
      headerElement: 'dt',

      // selector for the collapsible elements
      contentElement: 'dd',

      // class name, on the CONTENT block that should stay open on init
      preselected: 'expanded',

      // called every time a “contentElement” is collapsed. “this” is the accordion element, the first parameter passed is the “header”, the second is the “content”
      onCollapse: $.noop,

      // called every time a “contentElement” is expanded. “this” is the element, the first parameter passed is the “header”, the second is the “content”
      onExpand: $.noop,

      // called when the plugin is initialized. “this” is the element
      onInit: $.noop,

      // called when the plugin is detroyed. “this” is the element, the first parameter passed is a “headers” collection, the second is “contents”
      onDestroy: $.noop
    };
  } )( $, window, document );

} )( jQuery );
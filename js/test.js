QUnit.test( 'Registration', function( assert ) {
  assert.ok( $.fn.accordion, 'registered as a jQuery plugin' );

  var defaults = {
        headerElement: 'dt',
        contentElement: 'dd',
        preselected: 'expanded',
        onCollapse: function() {},
        onExpand: function() {},
        onInit: function() {},
        onDestroy: function() {}
      };

  assert.equal( $.fn.accordion.defaults, defaults.toString(), 'default settings are available' );
} );

QUnit.test( 'Default settings', function( assert ) {
  var $faq = $( '.faq' ),
      defaults = $.fn.accordion.defaults,
      newDefaults = $.extend( {}, $.fn.accordion.defaults,
        {
          headerElement: '.accordion-header',
          contentElement: '.accordion-panel'
        }
      );

  $.fn.accordion.defaults = newDefaults;
  $faq.accordion();

  assert.propEqual( $faq.data( 'plugin_accordion' ).settings, newDefaults, 'set new default settings' );

  $.fn.accordion.defaults = defaults;
} );

QUnit.test( 'Chainability', function( assert ) {
  var $faq = $( '.faq' );

  assert.ok( $faq.accordion().addClass( 'testing' ), 'can be chained' );
  assert.ok( $faq.hasClass( 'testing' ), 'successfully chained' );
} );

QUnit.test( 'ARIA attributes', function( assert ) {
  var $faq = $( '.faq' );

  $faq.accordion();

  assert.ok( $faq.is( '[role="tablist"]' ), 'added role' );
  assert.ok( $faq.is( '[aria-multiselectable="false"]' ), 'is not aria-multiselectable' );

  var $headers = $faq.data( 'accordion_headers' );
  $headers.map( function() {
    assert.ok( $( this ).is( '[role="tab"]' ), 'added role to headers' );
    assert.ok( $( this ).attr( 'aria-controls' ).length, 'added aria ”relationship” to content block' );
    assert.ok( $( this ).attr( 'aria-selected' ).length, 'added default aria “selected” state' );
    assert.ok( $( this ).attr( 'aria-expanded' ).length, 'added default aria “expanded” state' );
  } );

  var $contents = $faq.data( 'accordion_contents' );
  $contents.map( function() {
    assert.ok( $( this ).is( '[role="tabpanel"]' ), 'added role to content blocks' );
    assert.ok( $( this ).attr( 'aria-labelledby' ).length, 'added aria ”relationship” to header' );
    assert.ok( $( this ).attr( 'aria-hidden' ).length, 'added default aria “hidden” state' );
  } );
} );

QUnit.test( 'Callbacks', function( assert ) {
  var $faq = $( '.faq' );

  $faq.accordion( {
    onCollapse: function( $header, $content ) {
      assert.ok( $header.is( '[aria-selected="false"][aria-expanded="false"]' ), 'collapsed header:' + $header[0].id );
      assert.ok( $content.is( '[aria-hidden="true"]' ), 'collapsed content:' + $content[0].id );
    },
    onExpand: function( $header, $content ) {
      assert.ok( $header.is( '[aria-selected="true"][aria-expanded="true"]' ), 'clicked header:' + $header[0].id );
      assert.ok( $content.is( '[aria-hidden="false"]' ), 'expanded content:' + $content[0].id );
    }
  } );

  $( $faq.data( 'accordion_headers' ) ).first().trigger( 'click' );
  $( $faq.data( 'accordion_headers' ) ).first().trigger( 'click' );
} );

QUnit.test( 'Cleanup', function( assert ) {
  var $faq = $( '.faq' );

  $faq.accordion();
  $faq.accordion( 'destroy' );

  assert.notOk( $faq.data( 'plugin_accordion' ), 'destroyed' );
} );
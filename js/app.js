'use strict';

require.config({
  paths: {
    'underscore': 'lib/underscore-min',
    'jquery': 'lib/jquery-1.10.2.min',
    'backbone': 'lib/backbone-min',
    'localstorage': 'lib/backbone.localStorage-min',
    'jquery.foundation': 'lib/foundation.min'
  },  
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'jquery.foundation': {
        deps: ['jquery']
    }
  }
});

require(['jquery', 'underscore', 'backbone', 'localstorage', 'jquery.foundation'], function($, _, Backbone){
  
  var Product = Backbone.Model.extend({
    defaults: function () {
      return {
        id: '',
        name: '',
        precio: '',
        descripcion: '',
        image: ''
      };
    }
  });
  
  var Warehouse = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('warehouse'),
    model: Product
  });
  
  var Item = Backbone.Model.extend({
    defaults: function(){
      return {
        id: '',
        product_id: '',
        cantidad: '',
        name:'',
        precio:''
      };
    },
    validate: function(attrs, options) {
    if (attrs.cantidad < 1) {
      return "qty must be equal or greater than 1";
    }
  }
  });
  
  var Lineadecaja = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('lineadecaja'),
    model: Item
  });

  
  var WareHouseView = Backbone.View.extend({
    el: $('#products-list'),
    template: _.template($('#products-list-tmpl').html()),
    model: Product,
    events: {
      'click .btn-details': 'showDetails'
    },
    
    initialize: function () {
      _.bindAll(this, 'render', 'showDetails');
    },

    render: function () {
      WareHouse.fetch();
      WareHouse.comparator = 'name';
      WareHouse.sort();
      this.$el.html(this.template({
        products: WareHouse.toJSON()
      }));
      return this;
    },

    showDetails: function (ev) {
      var id = $(ev.target).closest('button').val();
      ProductDetailV.setItem(WareHouse.get(id));
      ProductDetailV.render();
    }
    
  });
  
  var NewProductView = Backbone.View.extend({
    el: $('#products-top'),
    template: _.template($('#products-new-tmpl').html()),
    model: Product,
    events: {
      'click .btn-add': 'guardar',
      'click .btn-add-fix': 'addfixtures'
    },
    
    initialize: function () {
      _.bindAll(this, 'render', 'guardar', 'addfixtures');
    },

    render: function () {
      this.$el.html(this.template({collectionLenght:WareHouse.length}));
      return this;
    },

    guardar: function (ev) {
      var nName = $('#name_form').val();
      var nPrice = $('#price_form').val();
      var nDescription = $('#desc_form').val();
      var nImage = $('#image_form').val();

      if(nName == '' || nPrice == '' || nDescription == '' || nImage == ''){
      } else {
        WareHouse.comparator = "id";
        WareHouse.sort();

        var nId = (!WareHouse.length) ? 1 : WareHouse.last().get('id') + 1;
        var nProduct = new Product({
          id: nId,
          name: nName,
          precio: nPrice,
          descripcion: nDescription,
          image: nImage
        });
        WareHouse.add(nProduct);
        nProduct.save();
        this.render();
      }
    },

    addfixtures: function (ev) {
      var fixture =[
        {
          nName:'Cellphone',
          nPrice:'500',
          nDescription:'It\'s a great cellphone!',
          nImage:'images/cellphone.jpg'
        },
        {
          nName:'Watch',
          nPrice:'120',
          nDescription:'Reasonable price for an awesome product',
          nImage:'images/watch.jpg'
        },
        {
          nName:'Mouse',
          nPrice:'30',
          nDescription:'A great pointer device!',
          nImage:'images/mouse.jpg'
        }
      ];
      var nId;
      var nProduct;
      
      WareHouse.comparator = "id";
      for(var i=0;i<3;i++) {
        WareHouse.sort();
        nId = (!WareHouse.length) ? 1 : WareHouse.last().get('id') + 1;
        nProduct = new Product({
          id: nId,
          name: fixture[i].nName,
          precio: fixture[i].nPrice,
          descripcion: fixture[i].nDescription,
          image: fixture[i].nImage
        });
        WareHouse.add(nProduct);
        nProduct.save();
      }
      this.render();
    }
    
  });
  
  var ProductDetailView = Backbone.View.extend({
    el: $('#shopping-cart-sidebar'),
    template: _.template($('#products-details-tmpl').html()),
    model: Product,

    events: {
      'click .btn-add-cart': 'addtocart',
    },

    initialize: function (options) {
      this.options = options || {};
      _.bindAll(this, 'render', 'addtocart');
    },
    
    render: function () {
      this.$el.html(this.template({
        product: this.options.product.toJSON(),
        inCart: checkLine(this.options.product.toJSON().id)
      }));
      return this;
    },
    addtocart: function() {
      var qty = $('#amount_form').val();
      if (addToCart(this.options.product.toJSON().id, parseInt(qty))){
        NavBarV.render();
        this.render();
      };
    },
    setItem: function(item) {
      this.options.product = item;
    }
  });
  
  var CheckOutView = Backbone.View.extend({
    el: $('#products-top'),
    template: _.template($('#cart-tmpl').html()),

    events: {
      'click .btn-checkout': 'checkout',
      'click .btn-remove-item': 'removeitem',
      'click .btn-reset-cart': 'resetcart',
      'change .qty-input': 'updateitem',
    },

    initialize: function (options) {
      this.options = options || {};
      _.bindAll(this, 'render', 'checkout', 'removeitem', 'updateitem');
    },
    
    render: function () {
      LineaDeCaja.fetch();
      this.$el.html(this.template({
        items: LineaDeCaja.toJSON(),
        hasItems: LineaDeCaja.length
      }));
      return this;
    },
    
    checkout: function() {
      var model;
      while (model = LineaDeCaja.first()) {
        model.destroy();
      }      
      NavBarV.render();
      this.render();
    },
    
    removeitem: function(ev) {
      var id = $(ev.target).closest('tr').data('id');
      var item = LineaDeCaja.get(id);
      item.destroy();
      LineaDeCaja.remove(item);
      this.render();
    },
    updateitem: function(ev) {
      var id = $(ev.target).closest('tr').data('id');
      var item = LineaDeCaja.get(id);
      item.set('cantidad', parseInt($(ev.target).val()));
      if (!item.isValid()) {
        alert(item.get('name') + ' ' + item.validationError);
      } else {
        item.save();
      }
      this.render();
    }
  });
  
  var ProductSlideView = Backbone.View.extend({
    el: $('#products-top'),
    template: _.template($('#products-slide-tmpl').html()),
    model: Product,

    events: {
      'click .btn-add-cart': 'addtocart',
    },

    initialize: function (options) {
      this.options = options || {};
      _.bindAll(this, 'render', 'addtocart');
    },

    addtocart: function(ev) {
      var id = $(ev.target).closest('button').val();
      if (addToCart(parseInt(id), 1)){
        NavBarV.render();
        this.render();
      };
    },
    
    render: function () {
      WareHouse.comparator = 'name';
      WareHouse.fetch();
      this.$el.html(this.template({ products: WareHouse.toJSON(), inCart:checkLine, hasItems: WareHouse.length }));
      this.$el.foundation({
        orbit: {
          animation: 'slide',
          timer_speed: 4000,
          pause_on_hover: true,
          animation_speed: 500,
          navigation_arrows: true,
          bullets: true,
          next_on_click: true
        }
      });
      $(window).triggerHandler('resize'); //Hack para que calcule bien el alto del slide
      return this;
    }
  });
  
  var NavBarView = Backbone.View.extend({
    el: $('#navbar'),
    template: _.template($('#navigation-tmpl').html()),

    initialize: function () {
      _.bindAll(this, 'render');
    },
    
    render: function () {
      LineaDeCaja.fetch();
      this.$el.html(this.template({ cartItems: LineaDeCaja.length }));
      this.$el.foundation();
      return this;
    }
  });
  
  //Verificacion si el producto ya existe en la linea de caja
  var checkLine = function (prodId) {
    LineaDeCaja.fetch();
    var result = _.findWhere(LineaDeCaja.toJSON(),{product_id:prodId});
    return (typeof result !== 'undefined');
  };
  
  //Agregado de items al carrito. Se extrajo porque se utiliza desde multiples vistas
  var addToCart = function (prodId, qty) {
    if(!checkLine(prodId)){
      var item = WareHouse.get(prodId).toJSON();
      
      LineaDeCaja.comparator = 'id';
      LineaDeCaja.sort();
      var nId = (!LineaDeCaja.length) ? 1 : LineaDeCaja.last().get('id') + 1;
      var nItem = new Item({
        id: nId,
        product_id  : prodId,
        cantidad: qty,
        name: item.name,
        precio: item.precio
      });
      if (!nItem.isValid()) {
        alert(nItem.get('name') + ' ' + nItem.validationError);
        return false;
      } else {
        LineaDeCaja.add(nItem);
        nItem.save();
      }
    } else {
      return false;
    }
    return true;
  };
  
  
  //Inicializo colecciones
  var WareHouse = new Warehouse();
  var LineaDeCaja = new Lineadecaja();

  //Cargo en memoria los items
  LineaDeCaja.fetch();
  WareHouse.comparator = 'name';
  WareHouse.sort();
  WareHouse.fetch();

  //Inicializo las vistas
  var NavBarV = new NavBarView();
  var CheckOutV = new CheckOutView();
  var WareHouseV = new WareHouseView();
  var NewProductV = new NewProductView();
  var ProductSlideV = new ProductSlideView();
  var ProductDetailV = new ProductDetailView();
  
  //Armado de rutas
  var AppRouter = Backbone.Router.extend({
    routes: {
      '': 'homeview',
      'list': 'warehouseview',
      'checkout': 'checkout',
      'newProduct': 'newP'
    },
    
    homeview: function(){
      $('#products-list').empty();
      $('#shopping-cart-sidebar').empty();
      NavBarV.render();
      ProductSlideV.render();
    },
    warehouseview: function(){
      $('#products-top').empty();
      NavBarV.render();
      WareHouseV.render();
    },
    checkout: function(){
      $('#products-list').empty();
      $('#shopping-cart-sidebar').empty();
      NavBarV.render();
      CheckOutV.render();
    },
    newP: function(){
      $('#products-list').empty();
      $('#shopping-cart-sidebar').empty();
      NavBarV.render();
      NewProductV.render();
    }
  });
  
  //Inicializo router e historico y la app
  var router = new AppRouter();
  Backbone.history.start();

});

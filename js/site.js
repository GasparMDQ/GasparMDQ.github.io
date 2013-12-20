$(function() {
  initApp();
  $('section').addClass('row');
  //Loads the phonebook into the element #phonebook-list, one contact per row
  loadPhoneBookOnBrowser();
});

function initApp() {
  retrievePhonebook();
  resetForm();
  $('form').submit(function(e) {
    e.preventDefault();
    var contact = Object.create(null);
    contact.name = e.target.name_form.value;
    contact.address = e.target.address_form.value;
    contact.cellphone = e.target.cell_form.value;
    contact.phone = e.target.home_form.value;
    contact.email = e.target.email_form.value;
    addToPhonebook(contact, e.target.id_form.value);
    resetForm();
    loadPhoneBookOnBrowser();
    return false;
  });
  
  $('form').bind('reset', function(e) {
    e.preventDefault();
    resetForm();
  });
}

function addToPhonebook(contact, id) {
  var phonebook = retrievePhonebook();
  if(id){
    phonebook.contacts.splice(id, 1);
    phonebook.contacts.push(contact);
  } else {
    phonebook.contacts.push(contact);
  }
  console.log(id);
  savePhonebook(phonebook);
}

function savePhonebook(phonebook) {
  localStorage.phonebook = JSON.stringify(phonebook);
}

function retrievePhonebook() {
  var phonebook = localStorage.phonebook;
  if (phonebook == null || phonebook == 'null') {
    phonebook = Object.create(null);
    phonebook.name = prompt('New phonebook owner:');
    phonebook.contacts = Array();
    savePhonebook(phonebook);
  }
  return JSON.parse(localStorage.phonebook);
}

function loadPhoneBookOnBrowser() {
  var pbook = retrievePhonebook(),
    length = pbook.contacts.length;

  //Container element: #phonebook-list
  $('#phonebook-list').empty();
  $('body header > h1').empty().append(pbook.name + '\'s Phonebook');
  for (var i = 0; i < length; i++) {
    var contact = pbook.contacts[i],
      $contactTemplate = $('.js-contact-contact');
      console.log($contactTemplate);
    $('#phonebook-list').append(
            $contactTemplate.clone().removeClass('js-contact-contact')
            .find('header').attr('id', 'header_' + i).html(contact.name).end()
      );
  }
  
  $('.contact').not('.js-contact-contact').addClass('row').append(function() {
    addCRUD($(this));
  });
  $('.contact > header').click(function() {
    toggleDetails($(this));
  });
  $('.btn-edit').click(function() {
    preSetFormForEdit($(this));
  });
  $('.btn-remove').click(function() {
    deleteContact($(this));
  });
}

function addCRUD($element) {
  $element.append($('.js-contact-crud').clone().removeClass('js-contact-crud'));
}

function preSetFormForEdit($element) {
  var row = $element.closest('.contact'),
          
    //replace all non numeric char with 'blank'
    id = row.find('header').attr('id').replace(/^\D+/g, ''),
    pbook = retrievePhonebook();
  $('input[type=submit]').val('Save');
  $('input[type=reset]').val('Cancel');

  $('#contact-form').find('#id_form').attr('value', id).end()
    .find('#name_form').val(pbook.contacts[id].name).end()
    .find('#address_form').val(pbook.contacts[id].address).end()
    .find('#cell_form').val(pbook.contacts[id].cellphone).end()
    .find('#home_form').val(pbook.contacts[id].phone).end()
    .find('#email_form').val(pbook.contacts[id].email);
}

function resetForm() {
  $('#contact-form').find('#id_form, #name_form, #address_form, '+
    '#cell_form, #home_form, #email_form').removeAttr('value').val('').show();
  $('input[type=submit]').val('Add');
  $('input[type=reset]').val('Reset');
}

function deleteContact($element) {
  var row = $element.closest('.contact'),
          
    //replace all non numeric char with 'blank'
    id = row.find('header').attr('id').replace(/^\D+/g, ''),
    pbook = retrievePhonebook();
  pbook.contacts.splice(id, 1);
  savePhonebook(pbook);
  loadPhoneBookOnBrowser();
}

function toggleDetails($element) {
  var id = $element.attr('id').replace(/^\D+/g, '');
  if (!$('#detail_' + id).length) {
    var pbook = retrievePhonebook(),
      contact = pbook.contacts[id];
    $element.after(function() {
      var $content = $('.js-contact-detail').clone()
        .removeClass('js-contact-detail').attr('id', 'detail_' + id)
        .append(contact.address + '<br/>' +
                  contact.cellphone + '<br/>'+
                  contact.phone + '<br/>' +
                  contact.email + '<br/>');
      return $content;
    });
  } else {
    $('#detail_' + id).remove();
  }
}

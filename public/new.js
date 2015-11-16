window.onload = (function(){
  // $('#password_2').on('keypress', checkPassword)
  $('#new-user-form').on('submit', checkSubmit)
})()

function checkPassword(){
  var password1 = $('#password_1').val()
  var password2 = $('#password_2').val()
  console.log(password1, password2)
  if(password1 !== password2){
    $('#password_2-label').css('color', 'red');
    return false
  } else {
    $('#password_2-label').css('color', 'black')
    $('#error-message').fadeOut(500)  
    return true
  }
}

function checkSubmit(event){
  var passwordsEqual = checkPassword()
  if (passwordsEqual === false){
  // $('#error-message').fadeOut(500) 
  console.log("not the same")
    event.preventDefault()
    $('#error-message').append('<p>The two password entries do not match.</p>').fadeIn(500)
  }
}
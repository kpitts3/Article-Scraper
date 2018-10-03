$(document).ready(function() {

  //Activate Carousel
  $('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true
  });
  setTimeout(autoplay, 4500);
  function autoplay() {
    $('.carousel').carousel('next');
    setTimeout(autoplay, 4500);
  }

  //Activate Modal
  $('.modal').modal();

  //Add Article to Saved
  $('.save').on('click', function() {
    var thisId = $(this).attr('data-id');

    $.ajax({
      type: 'POST',
      url: '/save/' + thisId,
      data: {
        _id: thisId
      }
    });
    location.reload();
  });

  $('.removeSave').on('click', function() {
    var thisId = $(this).attr('data-id');

    $.ajax({
      type: 'POST',
      url: '/unsave/' + thisId,
      data: {
        _id: thisId
      }
    });
    location.reload();
  });

  //Add Note to Article
  $('.addNote').on('click', function() {
    
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: '/addNote/' + $(this).data('id'),
      data: {
        text: $('#noteText').val(),
        created: Date.now()
      }
    });
    location.reload();
    $("#noteText").empty();
  });


  //Pull Up Modal for Notes
  $('.notesButton').on('click', function() {
    $('#noteText').empty();
    var dataId = $(this).attr('data-id');

    $('.addNote').data('id', dataId);
    $('#articleId').text(dataId);
  });

  //Delete a Note
  $('.deleteNote').on('click', function() {
    // Make an AJAX GET request to delete the notes from the db
    var thisId = $(this).data('id');
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/delete/' + thisId
      // On a successful call, clear the #results section
    });
    location.reload();
  });
});

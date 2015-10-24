$(function() {
    $("#tabs").tabs();
  });
  $(document).ready(function() {
    example1();
    example2();
    example3();
      
   $('#title1').bind('click', function() {
       showMenu1();
   });
   $('#title2').bind('click', function() {
       showMenu2();
   });
   $('#title3').bind('click', function() {
       showMenu3();
   });
      
      $('tr').bind('click', function() {
          $(this).toggleClass("green");
      });
      
    $('#run1').bind('click', function() {
      fourtyTwo();
      example1();
    });
    $('#run2').bind('click', function() {
      fourtyTwo();
      example2();
    });
    $('#run3').bind('click', function() {
      fourtyTwo();
      example3();
    });
  });
        
  function example1() {
            var input = $("#input1").val();
            var data = $.csv.toObjects(input);
            var html = generateTable(data);
            $('#result1').empty();
            $('#result1').html(html);
    }
    function example2() {
            var input = $("#input2").val();
            var data = $.csv.toObjects(input);
            var html = generateTable(data);
            $('#result2').empty();
            $('#result2').html(html);
    }
    function example3() {
            var input = $("#input3").val();
            var data = $.csv.toObjects(input);
            var html = generateTable(data);
            $('#result3').empty();
            $('#result3').html(html);
    }
    
  
//shows admin menu
    function showMenu1() {
        $('#hidden1').fadeToggle();
    }
//shows admin menu
    function showMenu2() {
        $('#hidden2').fadeToggle();
    }
//shows admin menu
    function showMenu3() {
        $('#hidden3').fadeToggle();
    }

  // build HTML table data from an array (one or two dimensional)
  function generateTable(data) {
    var html = '';

    if(typeof(data[0]) === 'undefined') {
      return null;
    }

    if(data[0].constructor === Object) {
        var i = 0;
      for(var row in data) {
        html += '<tr>\r\n';
        for(var item in data[row]) {
          html += "<td id='" + i + "'>" + data[row][item] + '</td>\r\n';
        }
        html += '</tr>\r\n';
          i++;
      }
    }
    
    return html;
  }

  function fourtyTwo() {
    alert('Retuning the chorus...');
  }
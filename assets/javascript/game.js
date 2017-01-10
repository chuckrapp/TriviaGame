//declare all global variables
var answerOrder = [1, 2, 3, 4];
var questionOrder = [];
var correctCounter = 0;
var incorrectCounter = 0;
var timeoutCounter = 0;
var questionNum = 0;
var gameState = 0;
var timerInterval = 15;

var selectedCategory = "" //24 total categories - 25 including option for all categories
var selectedDifficulty = ""; //3 difficulties (easy medium and hard) - 4 including option for all difficulties


//this function will convert the categories to a blank string to properly append the ajax URL
$('#buttonGo').on('click', function() {
  if ($("#selectCategory").val() == "any"){
    selectedCategory = "";
  } else {
    selectedCategory = "&category=" + $("#selectCategory").val();
  };

    //this function will convert the difficulties to a blank string to properly pull append the ajax URL
  if ($("#selectDifficulty").val() == "any") {
    selectedDifficulty = "";
  } else {
    selectedDifficulty = "&difficulty=" + $("#selectDifficulty").val();
  };

//calls function to make the ajax request with the users category and difficulty inputs
  pullData();
//these next 2 lines hide the settings section and show the questions sections respectively
    $('#sectionSettings').addClass('hidden');
    $('#sectionQuestions').removeClass('hidden');
});


//function to make the ajax call
function pullData() {
  $.ajax({
    url: "https://opentdb.com/api.php?amount=15&type=multiple" + selectedCategory + selectedDifficulty,
    method: 'GET',
    context: document.body
  })
//after its loaded runs the function  
  .done(function(response) {
//this countDown controls the constantly running timer
    var countDown = setInterval(function() {
//updates the HTML with the current time      
      $('#currentTimer').html(--timerInterval);
//checks to see if the time is up and runs the times up function
      if (timerInterval <= 0) {
        timesUp();
      };
    }, 1000);

//below function will update all of the HTML items, including question, answers, question number, and incorrect, correct, and timed out question counters
    function updateDisplays() {
      $("#displayQuestion").html(response.results[questionNum].question);
      $("#displayAnswer" + answerOrder[0]).html(response.results[questionNum].incorrect_answers[0]);
      $("#displayAnswer" + answerOrder[1]).html(response.results[questionNum].incorrect_answers[1]);
      $("#displayAnswer" + answerOrder[2]).html(response.results[questionNum].incorrect_answers[2]);
      $("#displayAnswer" + answerOrder[3]).html(response.results[questionNum].correct_answer);
      $("#displayQuestionNumber").html(questionNum + 1);
      $("#displayIncorrect").html(incorrectCounter);
      $("#displayCorrect").html(correctCounter);
      $("#displayTimeOut").html(timeoutCounter);
    };

//below function shuffles the answers so do not all get set to D
    function shuffle(randomOrder) {
      var currentOrder = randomOrder.length, placeHolder, randomNum;
// While there remain items to shuffle...
      while (0 !== currentOrder) {
// Pick a remaining item...
        randomNum = Math.floor(Math.random() * currentOrder);
        currentOrder -= 1;
// And swap it with the current item.
        placeHolder = randomOrder[currentOrder];
        randomOrder[currentOrder] = randomOrder[randomNum];
        randomOrder[randomNum] = placeHolder;
      };
//returns the newly shuffled array of answers
      return randomOrder;
    };

//below function will trigger a new question, adds 1 to the question number, checks what question its on, and updates the
//displays including removing showing and hiding appropriate classes
    function nextQuestion() {
      timerInterval = 15;
      questionNum++;
      answerOrder = shuffle(answerOrder);
      checkEndGame();
      updateDisplays();
      $('#sectionResults').addClass('hidden');
      $('#sectionQuestions').removeClass('hidden');
      countDown;
    };

//result after user lets the time run out
    function timesUp() {
      timerInterval = 5; //needs to be here so that timer stays above 5 (only counts 1 instance of 'timesUp')
      timeoutCounter++;
      $('#sectionQuestions').addClass('hidden');
      $('#sectionResults').removeClass('hidden');
      $('#feedback').html('Times Up!!');
      $('#feedbackDetail').html('You took too long, the correct answer was "' + response.results[questionNum].correct_answer + '"');
      setTimeout(nextQuestion, 3000);//loads next question after 3 seconds
    };

//checks to see what question game is on - if at 15 then stop the timer, and display results to user
    function checkEndGame() {
      if (questionNum == 15) {
        clearInterval(countDown);
        $('#sectionQuestions').addClass('hidden');
        $('#sectionResults').removeClass('hidden');
        $('#feedback').html('Game Over!!');
        $('#feedbackDetail').html("You got " + correctCounter + " questions right, " + incorrectCounter + " questions wrong, and didn't answer " + timeoutCounter + " questions at all.");
      };
    };

//this function checks to see if selected answer is the correct one
    $('#displayAnswer1, #displayAnswer2, #displayAnswer3, #displayAnswer4').click(function() {
//if it is, run correctCondition function - resets timer, adds counter to correct, and displays 'answer correct' text
      if (this.innerText == response.results[questionNum].correct_answer) {
        timerInterval = 15;
        correctCounter++;
        $('#sectionQuestions').addClass('hidden');
        $('#sectionResults').removeClass('hidden');
        $('#feedback').html('Correct!!');
        $('#feedbackDetail').html('You correctly chose "' + response.results[questionNum].correct_answer + '"');
        setTimeout(nextQuestion, 3000); //loads next question after 3 seconds
//if its not correct - resets timer, adds counter to incorrect, and displays 'answer incorrect' text
      } else {
        incorrectCounter++;
        $('#sectionQuestions').addClass('hidden');
        $('#sectionResults').removeClass('hidden');
        $('#feedback').html('Wrong!!');
        $('#feedbackDetail').html('The correct answer was "' + response.results[questionNum].correct_answer + '"');
        timerInterval = 15;
        setTimeout(nextQuestion, 3000);//loads next question after 3 seconds
      };
    });

    updateDisplays();
    answerOrder = shuffle(answerOrder);
  });
};

//pre-loads the HTML items with starting values
$("#displayIncorrect").html(incorrectCounter);
$("#displayCorrect").html(correctCounter);
$("#displayTimeOut").html(timeoutCounter);
$("#displayQuestionNumber").html(questionNum + 1);
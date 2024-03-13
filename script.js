window.onload = () => {
    quiz.init();
}

class Quiz {
    currentQuestionIndex = -1;

    // initializing the app
    async init() {

        this.progress = document.querySelector("#progress");
        this.countDownInfo = document.querySelector(".count-down");
        this.questionHeading = document.getElementById("question-heading");
        this.answersList = document.querySelector("#answers-list");
        this.summary = document.querySelector(".summary");
        this.submitButton = document.querySelector("#submit-answer");
        this.submitButton.addEventListener("click", this.submitAnswer);
        this.restartButton = document.querySelector("#restart-quiz");
        this.restartButton.addEventListener("click", this.restartQuiz);

        await this.loadData();
        this.restartQuiz();
    }

    // loading the questions data from json file
    loadData = async () => {
        const { questions, quizMaxTime } = await fetch("questions.json").then(response => response.json());
        if (!questions) {
            console.log("No questions");
            return;
        }
        this.quizMaxTime = quizMaxTime * 1000; //max time in miliseconds
        this.questions = questions;
    }

    // submitting answer when clicking 'Next question' button
    submitAnswer = () => {
        const userSelectedInput = document.querySelector("input[type='radio']:checked");
        if (!userSelectedInput) return;
        const userSelectedIndex = userSelectedInput.getAttribute("data-index"); //index of the selected answer
        const question = this.questions[this.currentQuestionIndex];
        question.userSelectedIndex = userSelectedIndex;
        this.setNextQuestionData();
    }

    // restarting the quiz
    restartQuiz = () => {
        this.questions.forEach(q => q.userSelectedIndex = -1);
        this.currentQuestionIndex = -1;
        this.countDown();
        this.setNextQuestionData();
        this.answersList.classList.remove("hide");
        this.submitButton.classList.remove("hide");
        this.restartButton.classList.remove("show");
        this.summary.classList.add("hide");
        this.progress.classList.remove("hide");
    }

    // timer
    countDown = () => {
        if (this.countDownInterval) return;
        this.quizStartTIme = new Date().getTime();
        this.quizEndTime = this.quizStartTIme + this.quizMaxTime;

        this.countDownInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            if (currentTime >= this.quizEndTime) {
                console.log("End of quiz");
                this.stopCountDown();
                this.showSummary();
                return;
            }
            const timeLeft = Math.floor((this.quizEndTime - currentTime) / 1000);
            this.countDownInfo.innerHTML = `Time left: ${timeLeft} seconds`;
        }, 1000);
    }

    // showing the next question
    setNextQuestionData = () => {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length) {
            console.log("End of quiz");
            this.showSummary();
            return;
        }
        const question = this.questions[this.currentQuestionIndex];
        this.questionHeading.innerHTML = question.q;
        this.progress.innerHTML = `Question ${this.currentQuestionIndex + 1} from ${this.questions.length}`;

        const answersHtml = question.answers.map((answerText, index) => {
            const answerId = `answer${index}`;
            return `
                <li>
                    <input type="radio" name="answer" id="${answerId}" data-index="${index}" class="answer">
                    <label for="${answerId}">${answerText}</label>
                </li>`;
        }).join("");

        this.answersList.innerHTML = answersHtml;
    }

    // showing the results summary
    showSummary = () => {
        this.stopCountDown();
        this.answersList.classList.add("hide");
        this.submitButton.classList.add("hide");
        this.restartButton.classList.add("show");
        this.summary.classList.remove("hide");
        this.progress.classList.add("hide");
        this.questionHeading.innerHTML = "Results summary:";

        let numCorrectAnswers = 0;
        let summaryHtml = this.questions.map((question, questionIndex) => {
            const answersHtml = question.answers.map((answerText, answerIndex) => {
                const answerId = `${questionIndex}-${answerIndex}`;
                let classToAdd = "";
                let checkedAttr = "";
                if (question.userSelectedIndex !== undefined) {
                    if (answerIndex == question.correctAnswerNum) {
                        classToAdd = "correct-answer";
                        if (question.userSelectedIndex == question.correctAnswerNum) {
                        checkedAttr = "checked";
                        numCorrectAnswers++;
                        }
                    }
                    if (answerIndex == question.userSelectedIndex 
                        && question.userSelectedIndex != question.correctAnswerNum) {
                        classToAdd = "wrong-answer";
                        checkedAttr = "checked";
                    }
                }
                return `
                    <li class="${classToAdd}">
                        <input type="radio" disabled name="answer${questionIndex}-${answerIndex}" id="${answerId}" data-index="" class="answer" ${checkedAttr} >
                        <label for="${answerId}">${answerText}</label>
                    </li>`;
            }).join("");
            return `
                <h4>Question ${questionIndex + 1} : ${question.q} </h4>
                <ul>${answersHtml}</ul>`;
        }).join("");
        summaryHtml += `
            <hr>
            <h3> Correct answers count: ${numCorrectAnswers} / ${this.questions.length} </h3>`;
        this.summary.innerHTML = summaryHtml;
    }

    // stopping the timer
    stopCountDown = () => {
        clearInterval(this.countDownInterval);
        this.countDownInterval = null;
        this.countDownInfo.innerHTML = "";
    }
}

const quiz = new Quiz();
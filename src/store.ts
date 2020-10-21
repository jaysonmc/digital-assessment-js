/* eslint-disable security/detect-object-injection */
import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import VuexPersistence from "vuex-persist";
import { RootState, SurveyScoring } from "./types";
import { SurveyModel } from "survey-vue";
import isEmpty from "lodash.isempty";
import resultsCalculationFile from "./survey-results.json";

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: (state: RootState) => ({
    toolData: state.toolData,
    currentPageNo: state.currentPageNo
  })
});

/**
 * Helper functions which determines which sections are enabled based on Survey Data
 * @param state
 * @param surveyData
 */
const determineSectionsEnabled = (
  state: RootState,
  surveyData: SurveyModel
) => {
  let sections = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten"
  ];

  for (let i in sections) {
    let sectionNumber = sections[i];
    let enabledFlag = surveyData.getValue(`section_${sectionNumber}_enable`);

    if (typeof enabledFlag === "boolean") {
      // @ts-ignore
      state[
        `section${sectionNumber.charAt(0).toUpperCase() +
          sectionNumber.slice(1)}Enabled`
      ] = enabledFlag;
    } else {
      // @ts-ignore
      state[
        `section${sectionNumber.charAt(0).toUpperCase() +
          sectionNumber.slice(1)}Enabled`
      ] = enabledFlag === "true";
    }
  }
};

/**
 * Helper function which will update the store's data based on survey data
 * @param state
 * @param surveyData
 */
const updateSurveyData = (state: RootState, surveyData: SurveyModel) => {
  determineSectionsEnabled(state, surveyData);
  state.surveyModel = surveyData;
  state.currentPageNo = surveyData.currentPageNo;
  //freeze this data so we can load from localStorage
  state.toolData = Object.freeze(surveyData.data);
  state.answerData = surveyData.getPlainData({
    includeEmpty: false
  });
};

const calculateScoreForQuestion = (
  currentSectionTotal: number,
  currentSectionScore: number,
  sectionName: string,
  questionName: string,
  questionValue: any,
  questionType: string,
  questionData?: any
): {
  sectionTotal: number;
  sectionScore: number;
} => {
  let sectionScore = currentSectionScore;
  let sectionTotal = currentSectionTotal;

  // @ts-ignore
  let questionResultsObj = resultsCalculationFile["sections"][sectionName];
  if (typeof questionResultsObj !== "undefined") {
    questionResultsObj = questionResultsObj["questions"][questionName];
    if (typeof questionResultsObj !== "undefined") {
      let points = questionResultsObj.points;
      let scoring = questionResultsObj.scoring;

      /* boolean questions point calculation
       * 1 - Matches the value for the correctAnswer key if it exists in the scoring map
       * 2 - If the scoring map does not exist, assign full points if the answer is true
       * */
      if (questionType === "boolean") {
        sectionTotal += points;
        if (scoring) {
          if (
            scoring.correctAnswer &&
            `${scoring.correctAnswer}` === `${questionValue}`
          ) {
            sectionScore += points;
          }
        } else if (`${questionValue}` === "true") {
          sectionScore += points;
        }
      } else if (questionType === "rating") {
        /* rating question point calculation
         * 1 - If there is a scoring map
         *   a) If the inverse flag is specified as true
         *     * minimum will be awarded full points
         *     * maximum will be awarded no points
         *     * in between will be calculated as (rateMax - score)/rateMax * points
         * 2 - If there is no scoring map
         *   a) maximum will be awarded full points
         *   b) minimum will be awarded no points
         *   c) in between will be calculated as score/rateMax * points
         *
         * */
        if (typeof questionData !== "undefined") {
          let rateMin = questionData["rateMin"];
          let rateMax = questionData["rateMax"];
          if (typeof rateMin === "number" && typeof rateMax === "number") {
            sectionTotal += points;
            if (scoring) {
              if (scoring.inverse === true) {
                if (questionValue === rateMin) {
                  sectionScore += points;
                } else if (
                  typeof questionValue === "string" &&
                  !isNaN(Number.parseInt(questionValue))
                ) {
                  sectionScore +=
                    ((rateMax - Number.parseInt(questionValue)) / rateMax) *
                      points +
                    1;
                }
              }
            } else if (questionValue === rateMax) {
              sectionScore += points;
            } else if (
              typeof questionValue === "string" &&
              !isNaN(Number.parseInt(questionValue))
            ) {
              sectionScore +=
                (Number.parseInt(questionValue) / rateMax) * points;
            }
          } else {
            throw new Error(
              `rateMin and rateMax must be numbers provided in questionData to calculate score for question ${questionName}`
            );
          }
        } else {
          throw new Error(
            `rateMin and rateMax must be numbers provided in questionData to calculate score for question ${questionName}`
          );
        }
      } else if (questionType === "radiogroup") {
        /* radiogroup question point calculation
         * !!! scoring section must be provided otherwise no point calculation will be awarded nor points added to the total !!!
         * 1) points will be multiplied by a percentage based on the answer selected
         * 2) if the answer does not exist in the scoring map then no points will be awarded
         */
        if (typeof scoring !== "undefined") {
          sectionTotal += points;
          if (
            typeof scoring[questionValue] === "number" &&
            scoring[questionValue] <= 100 &&
            scoring[questionValue] >= 0
          ) {
            sectionScore += points * (scoring[questionValue] / 100);
          }
        }
      }
    } else {
      throw new Error(
        `question ${questionName} for section ${sectionName} does not exist in survey-results.json`
      );
    }
  } else {
    throw new Error(
      `section ${sectionName} does not exist in survey-results.json`
    );
  }
  return {
    sectionScore: sectionScore,
    sectionTotal: sectionTotal
  };
};

/**
 * Helper function that will calculate the result for the survey
 * @param state
 * @param surveyData
 */
const calculateSurveyResult = (state: RootState, surveyData: SurveyModel) => {
  const resultsMap = resultsCalculationFile;
  let scoring: SurveyScoring = {};
  let surveyAnswersArray = surveyData.getPlainData({
    includeEmpty: true
  });

  let stateKeys = Object.keys(state);
  for (let i in stateKeys) {
    let stateKey: string = stateKeys[i];
    if (stateKey.endsWith("Enabled")) {
      // @ts-ignore
      if (state[stateKey] === true) {
        scoring = {
          ...scoring,
          [stateKey.replace("Enabled", "") + "Score"]: 0,
          [stateKey.replace("Enabled", "") + "Total"]: 0
        };
      }
    }
  }

  if (surveyAnswersArray.length === 0) {
    state.scoring = scoring;
  } else {
    // loop over each question, determine what section it belongs to
    // refer to the resultsMap to award points

    for (let i in surveyAnswersArray) {
      let questionObj = surveyAnswersArray[i];
      let questionName = questionObj.name;
      let questionValue = questionObj.value;
      // eslint-disable-next-line
      let questionPanelName = surveyData.getQuestionByName(questionName).page.name;

      // section zero question
      if (
        questionPanelName.startsWith("sectionOne") &&
        state.sectionOneEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionOneTotal,
          scoring.sectionOneScore,
          "sectionOne",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionOneScore = newScores.sectionScore;
        scoring.sectionOneTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionTwo") &&
        state.sectionTwoEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionTwoTotal,
          scoring.sectionTwoScore,
          "sectionTwo",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionTwoScore = newScores.sectionScore;
        scoring.sectionTwoTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionThree") &&
        state.sectionThreeEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionThreeTotal,
          scoring.sectionThreeScore,
          "sectionThree",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionThreeScore = newScores.sectionScore;
        scoring.sectionThreeTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionFour") &&
        state.sectionFourEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionFourTotal,
          scoring.sectionFourScore,
          "sectionFour",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionFourScore = newScores.sectionScore;
        scoring.sectionFourTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionFive") &&
        state.sectionFiveEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionFiveTotal,
          scoring.sectionFiveScore,
          "sectionFive",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionFiveScore = newScores.sectionScore;
        scoring.sectionFiveTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionSix") &&
        state.sectionSixEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionSixTotal,
          scoring.sectionSixScore,
          "sectionSix",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionSixScore = newScores.sectionScore;
        scoring.sectionSixTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionSeven") &&
        state.sectionSevenEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionSevenTotal,
          scoring.sectionSevenScore,
          "sectionSeven",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionSevenScore = newScores.sectionScore;
        scoring.sectionSevenTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionEight") &&
        state.sectionEightEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionEightTotal,
          scoring.sectionEightScore,
          "sectionEight",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionEightScore = newScores.sectionScore;
        scoring.sectionEightTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionNine") &&
        state.sectionNineEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionNineTotal,
          scoring.sectionNineScore,
          "sectionNine",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionNineScore = newScores.sectionScore;
        scoring.sectionNineTotal = newScores.sectionTotal;
      } else if (
        questionPanelName.startsWith("sectionTen") &&
        state.sectionTenEnabled
      ) {
        let newScores = calculateScoreForQuestion(
          // @ts-ignore
          scoring.sectionTenTotal,
          scoring.sectionTenScore,
          "sectionTen",
          questionName,
          questionValue,
          surveyData.getQuestionByName(questionName).getType(),
          surveyData.getQuestionByName(questionName)
        );
        scoring.sectionTenScore = newScores.sectionScore;
        scoring.sectionTenTotal = newScores.sectionTotal;
      }

      state.scoring = scoring;
    }
  }
};

const store: StoreOptions<RootState> = {
  plugins: [vuexLocal.plugin],
  state: {
    answerData: [],
    scoring: {},
    sectionOneEnabled: false,
    sectionTwoEnabled: false,
    sectionThreeEnabled: false,
    sectionFourEnabled: false,
    sectionFiveEnabled: false,
    sectionSixEnabled: false,
    sectionSevenEnabled: false,
    sectionEightEnabled: false,
    sectionNineEnabled: false,
    sectionTenEnabled: false,
    surveyModel: undefined,
    toolData: undefined,
    currentPageNo: 0
  },
  mutations: {
    // mutation to reset the state when a user resets the survey
    resetSurvey(state: RootState) {
      state.answerData = [];
      state.surveyModel = undefined;
      state.currentPageNo = 0;
      state.toolData = {};
      state.scoring = {};
      state.sectionOneEnabled = false;
      state.sectionTwoEnabled = false;
      state.sectionThreeEnabled = false;
      state.sectionFourEnabled = false;
      state.sectionFiveEnabled = false;
      state.sectionSixEnabled = false;
      state.sectionSevenEnabled = false;
      state.sectionEightEnabled = false;
      state.sectionNineEnabled = false;
      state.sectionTenEnabled = false;
    },

    // update state with results from survey
    // every time a value has changed or survey completed
    updateSurveyData(state: RootState, result: SurveyModel) {
      updateSurveyData(state, result);
    },

    calculateResult(state: RootState, result: SurveyModel) {
      updateSurveyData(state, result);
      calculateSurveyResult(state, result);
    },

    createResultsToken(state) {
      let data = {
        scoring: state.scoring,
        sectionsEnabled: {
          sectionOneEnabled: state.sectionOneEnabled,
          sectionTwoEnabled: state.sectionTwoEnabled,
          sectionThreeEnabled: state.sectionThreeEnabled,
          sectionFourEnabled: state.sectionFourEnabled,
          sectionFiveEnabled: state.sectionFiveEnabled,
          sectionSixEnabled: state.sectionSixEnabled,
          sectionSevenEnabled: state.sectionSevenEnabled,
          sectionEightEnabled: state.sectionEightEnabled,
          sectionNineEnabled: state.sectionNineEnabled,
          sectionTenEnabled: state.sectionTenEnabled
        }
      };
    }
  },
  getters: {
    inProgress: state => {
      return !isEmpty(state.toolData);
    }
  }
};

export default new Vuex.Store<RootState>(store);

import { SurveyModel } from "survey-vue";

export interface SurveyScoring {
  sectionOneScore?: number;
  sectionOneTotal?: number;
  sectionTwoScore?: number;
  sectionTwoTotal?: number;
  sectionThreeScore?: number;
  sectionThreeTotal?: number;
  sectionFourScore?: number;
  sectionFourTotal?: number;
  sectionFiveScore?: number;
  sectionFiveTotal?: number;
  sectionSixScore?: number;
  sectionSixTotal?: number;
  sectionSevenScore?: number;
  sectionSevenTotal?: number;
  sectionEightScore?: number;
  sectionEightTotal?: number;
  sectionNineScore?: number;
  sectionNineTotal?: number;
  sectionTenScore?: number;
  sectionTenTotal?: number;
}

export interface RootState {
  sectionOneEnabled: boolean;
  sectionTwoEnabled: boolean;
  sectionThreeEnabled: boolean;
  sectionFourEnabled: boolean;
  sectionFiveEnabled: boolean;
  sectionSixEnabled: boolean;
  sectionSevenEnabled: boolean;
  sectionEightEnabled: boolean;
  sectionNineEnabled: boolean;
  sectionTenEnabled: boolean;
  answerData: any[];
  scoring: SurveyScoring;
  surveyModel?: SurveyModel;
  toolData: any;
  currentPageNo: number;
}

export interface ResultsData {
  scoring: SurveyScoring;
  sectionsEnabled: any;
  data: any;
}

<script src="../store.ts"></script>
<template>
  <div class="row" style="padding: 0 15px;">
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionOneEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionOne.title[language]"
      :section-description="
        ResultsJSON.sections.sectionOne.description[language]
      "
      :section-score="$store.state.scoring.sectionOneScore"
      :section-total-score="$store.state.scoring.sectionOneTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionOne.questions)
      "
      :section-results="ResultsJSON.sections.sectionOne.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionTwoEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionTwo.title[language]"
      :section-description="
        ResultsJSON.sections.sectionTwo.description[language]
      "
      :section-score="$store.state.scoring.sectionTwoScore"
      :section-total-score="$store.state.scoring.sectionTwoTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionTwo.questions)
      "
      :section-results="ResultsJSON.sections.sectionTwo.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionThreeEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionThree.title[language]"
      :section-description="
        ResultsJSON.sections.sectionThree.description[language]
      "
      :section-score="$store.state.scoring.sectionThreeScore"
      :section-total-score="$store.state.scoring.sectionThreeTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionThree.questions)
      "
      :section-results="ResultsJSON.sections.sectionThree.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionFourEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionFour.title[language]"
      :section-description="
        ResultsJSON.sections.sectionFour.description[language]
      "
      :section-score="$store.state.scoring.sectionFourScore"
      :section-total-score="$store.state.scoring.sectionFourTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionFour.questions)
      "
      :section-results="ResultsJSON.sections.sectionFour.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionFiveEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionFive.title[language]"
      :section-description="
        ResultsJSON.sections.sectionFive.description[language]
      "
      :section-score="$store.state.scoring.sectionFiveScore"
      :section-total-score="$store.state.scoring.sectionFiveTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionFive.questions)
      "
      :section-results="ResultsJSON.sections.sectionFive.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionSixEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionSix.title[language]"
      :section-description="
        ResultsJSON.sections.sectionSix.description[language]
      "
      :section-score="$store.state.scoring.sectionSixScore"
      :section-total-score="$store.state.scoring.sectionSixTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionSix.questions)
      "
      :section-results="ResultsJSON.sections.sectionSix.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionSevenEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionSeven.title[language]"
      :section-description="
        ResultsJSON.sections.sectionSeven.description[language]
      "
      :section-score="$store.state.scoring.sectionSevenScore"
      :section-total-score="$store.state.scoring.sectionSevenTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionSeven.questions)
      "
      :section-results="ResultsJSON.sections.sectionSeven.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionEightEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionEight.title[language]"
      :section-description="
        ResultsJSON.sections.sectionEight.description[language]
      "
      :section-score="$store.state.scoring.sectionEightScore"
      :section-total-score="$store.state.scoring.sectionEightTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionEight.questions)
      "
      :section-results="ResultsJSON.sections.sectionEight.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionNineEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionNine.title[language]"
      :section-description="
        ResultsJSON.sections.sectionNine.description[language]
      "
      :section-score="$store.state.scoring.sectionNineScore"
      :section-total-score="$store.state.scoring.sectionNineTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionNine.questions)
      "
      :section-results="ResultsJSON.sections.sectionNine.results"
    />
    <br />
    <ResultsSectionContainer
      v-if="$store.state.sectionTenEnabled"
      :survey="survey"
      :language="language"
      :section-name="ResultsJSON.sections.sectionTen.title[language]"
      :section-description="
        ResultsJSON.sections.sectionTen.description[language]
      "
      :section-score="$store.state.scoring.sectionTenScore"
      :section-total-score="$store.state.scoring.sectionTenTotal"
      :sections-questions="
        Object.keys(ResultsJSON.sections.sectionTen.questions)
      "
      :section-results="ResultsJSON.sections.sectionTen.results"
    />
    <br />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Model } from "survey-vue";
import ResultsSectionContainer from "@/components/ResultsSectionContainer.vue";
import ResultsJSON from "../survey-results.json";

@Component({
  components: {
    ResultsSectionContainer
  }
})
export default class ResultsContainer extends Vue {
  @Prop() public language!: string;
  @Prop() public survey!: Model;
  ResultsJSON = ResultsJSON;
}
</script>

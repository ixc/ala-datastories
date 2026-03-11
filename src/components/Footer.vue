<template>

	<footer>
    <div class="credits">
      ALA Lens is an outcome of <em>Redesigning Digital Biodiversity Experience</em>, a research project undertaken by Mitchell Whitelaw and Adrian Mackenzie of the Australian National University, supported by the Atlas of Living Australia. First published August 2024. Version 1.0.2, October 2025.
    </div>
    <template v-if="!extraFq">
	<hr>

    <div class="footer-container column-screen page-columns page-full">

      <div class="column-footer">

        <p class="footer-text">The ALA is made possible by contributions from its partners, is supported

        by

        <a href="https://www.education.gov.au/national-collaborative-research-infrastructure-strategy-ncris" class="footer-link" data-original-href="https://www.education.gov.au/national-collaborative-research-infrastructure-strategy-ncris">NCRIS</a>, is hosted by

               <a href="https://csiro.au/" class="footer-link" data-original-href="https://csiro.au/">CSIRO</a>, and is the Australian node of

               <a href="https://www.gbif.org/en/" id="d-article" class="footer-link" data-original-href="https://www.gbif.org/en/">GBIF</a>.

        </p>

        <a href="https://www.education.gov.au/national-collaborative-research-infrastructure-strategy-ncris" data-original-href="https://www.education.gov.au/national-collaborative-research-infrastructure-strategy-ncris">

          <img src="@/assets/img/NCRIS_logo.png" class="logo-ncris" alt="NCRIS logo">

          

          </a>

        <a href="https://csiro.au/" data-original-href="https://csiro.au/">

          <img src="@/assets/img/CSIRO_logo.png" class="logo-csiro" alt="CSIRO logo">

          

          </a>

        <a href="https://www.gbif.org/en/" data-original-href="https://www.gbif.org/en/">

          <img src="@/assets/img/GBIF_109px.png" class="logo-gbif" alt="GBIF logo">

          

          </a>

      </div>

      <div class="column-footer" id="footer-logo">

        <p class="footer-text"><strong>Acknowledgement of Traditional Owners and Country</strong></p>

        <p class="footer-text-small">The Atlas of Living Australia acknowledges Australia's Traditional Owners

        and pays respect to the past and present Elders of the nation's Aboriginal

        and Torres Strait Islander communities. We honour and celebrate the

        spiritual, cultural and customary connections of Traditional Owners to

        country and the biodiversity that forms part of that country.<br><br></p>

      </div>

  <!--  </div>-->

  </div>

    <div class="copright-container column-screen">

      <div class="copyright-row">

       <div class="copyright-width">

        <div class="copyright-column-left">

            <p class="copyright-text">

              This work is licensed under a <a style="color:#fff!important;" href="https://creativecommons.org/licenses/by/3.0/au/" data-original-href="https://creativecommons.org/licenses/by/3.0/au/">Creative Commons Attribution 3.0 Australia License</a>

              <a rel="license" href="http://creativecommons.org/licenses/by/3.0/au/" data-original-href="http://creativecommons.org/licenses/by/3.0/au/"><img alt="Creative Commons License" style="border-width:0" src="@/assets/img/cc-by.png"></a>

            </p>

        </div><!--col end -->

        <div class="copyright-column-right">

           <p class="copyright-text">

             <a style="color:#fff!important;" href="https://www.ala.org.au/terms-of-use#cy" data-original-href="https://www.ala.org.au/terms-of-use#cy">Copyright</a>

             &nbsp;&nbsp;
             <a style="color:#fff!important;" href="https://www.ala.org.au/terms-of-use" data-original-href="https://www.ala.org.au/terms-of-use">Terms of Use</a>

             &nbsp;&nbsp;
             <a style="color:#fff!important;" href="https://status.ala.org.au/" data-original-href="https://status.ala.org.au/">System Status</a>

           </p>

        </div>

      </div>

      </div><!-- row end -->

  </div>
    </template>
  </footer>
</template>

<script>
import { extraFq } from '../apiConfig.js'

export default {

  name: 'Footer',

  data () {
    return {
      extraFq,
    }
  }
}
</script>

<style lang="css" scoped>

	footer{
		margin-top:10rem;
	}
</style>
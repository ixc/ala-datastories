
<script setup>
  import HexMap from './components/HexMap.vue'
  import FacetGroup from './components/FacetGroup.vue'
  import ObsTile from './components/ObsTile.vue'
  import SpeciesRank from './components/SpeciesRank.vue'
  import DecadeFacets from './components/DecadeFacets.vue'
  import SpeciesSearch from './components/SpeciesSearch.vue'
  import Menu from './components/Menu.vue'
  import Footer from './components/Footer.vue'

  import axios from 'axios'
  import { apiState } from './apiState.js'
  import speciesGroups from './assets/data/speciesGroups.json'
  import { extraFq } from './apiConfig.js'
</script>

<template>

    <Menu home-path="."/>

    <section v-if="!extraFq">
       <div class="content-wrapper landing">
         <!-- <h1>ALA <img src="./assets/img/title-asterisk.svg" class="title-asterisk"> Explorer Hub</h1>  -->

         <h1>ALA<span class="logotype">
          <img src="./assets/img/lens.svg" class="title-logo" alt="">Lens</span>
        </h1>
         <h2 class="tagline">New views of the Atlas of Living Australia</h2>


         <div class="intro-wrap">
          <img src="./assets/img/bubble-concrete.png" class="landing-bubble" alt="Nested circles showing images of Australian wildlife and flora">

          <div class="intro-text">
            <p>Try out new views of the ALA, designed to encourage exploration and discovery of species, data and place.</p>
            <p>This site presents outcomes of a research partnership with the Australian National University that aims to investigate and enrich user experiences of biodiversity data. </p>

            <p class="image-credits">Images (all CC-BY-NC):
              Kai Squires, andrewpavlov, mikegrow,
              kerrbrad, Matt Campbell, Toby Esplin,
              darcywhittaker
            </p>
          </div>
       </div>



        <h2>Data Stories</h2>
        <h4>Dive into data in the ALA with these interactive investigations</h4>

        <div class="ds-tile-wrap">
          <a class="ds-tile" href="data-stories/digging-into-data/">
            <h4>
              Digging into Data
            </h4>
            <img src="./assets/img/digging-icon.png" alt="">
            <p>This ALA is made of biodiversity data; but where does this data come from?</p>
          </a>


            <a class="ds-tile" href="data-stories/threatened-species/">
              <h4>
                 Threatened Species
              </h4>
              <img src="./assets/img/threatened-icon.png" alt="">
              <p>What does the ALA reveal about Australia's threatened species, and our efforts to protect them? </p>
            </a>


          <a class="ds-tile" href="data-stories/seasonal-change/">
            <h4>
              Seasonal Change
            </h4>
            <img src="./assets/img/seasonal-icon.png" alt="">
            <p>The cycle of the seasons shapes life around us; how does it shape the data in the ALA?</p>
          </a>

        </div>


        <h2>Lens<img src="./assets/img/lens.svg" class="title-logo" alt="">Interface</h2>
        <h4>Browse, discover, facet and filter: the Lens interface is a new way to explore the ALA. Start at one of our favourite spots, or</h4>

        <button @click="locateMe">Use my location</button>

      </div>
    </section>

    <section v-if="extraFq">
      <div class="content-wrapper landing">
        <h2>Lens<img src="./assets/img/lens.svg" class="title-logo" alt="">Interface</h2>
        <h4>Browse, discover, facet and filter: the Lens interface is a new way to explore the ALA. Start at one of our favourite spots, or</h4>

        <button @click="locateMe">Use my location</button>
      </div>
    </section>


    <div class="focusInfoBar">
      <div class="obsCountWrapper">
        <h4 v-if="queryLoaded">{{occurrenceData ? formatCount(occurrenceData.totalRecords) : 0}}</h4>
        <span class="countLabel" v-if="queryLoaded">occurrences</span>
        <h4 v-if="!queryLoaded">...</h4>
        <span class="countLabel" v-if="!queryLoaded">loading</span>
      </div>
      <div class="filterTagWrapper">
        <div class="filterTag" v-for="f in apiState.filters" :class="{group:f.fieldLabel=='Lifeform'}">
          <p class="label">{{f.fieldLabel.includes("Status") ? "status" : f.fieldLabel.toLowerCase() }}</p>
          <p class="value">
            <img v-if="f.icon" class="groupIcon" :src="`${siteRoot}/icons/${f.icon}`"/>
            {{f.valueLabel}}
            <a v-if="f.fieldLabel=='Species'" class="speciesInfo" :href="'https://bie.ala.org.au/species/'+f.value" target="_blank"><img src="./assets/img/species-info-reverse.svg"></a>
          </p>
          <span class="close" @click="apiState.removeFilter(f)">&#215;</span>
        </div>
      </div>
    </div>

<!-- map -->
    <div class="mapWrapper">
      <HexMap v-if="geoFilter" :query="hexMapQuery" :record-count="occurrenceData ? occurrenceData.totalRecords : null" :query-loaded="queryLoaded" :obs="occurrenceData ? groupedOccurrences : []" :filterCenter="{lat: geoFilter.lat, lng: geoFilter.lon}" :filterRadius="geoFilter.radius" :zoom="mapZoom" ref="hexmap" @set-geo-focus="setGeoFilter" @mapready="mapInit" @updateBins="updateMapBins" @show-modal="setObsModal"/>







        <div class="obsTileWrapper" ref="tilewrapper" v-if="occurrenceData">

          <div class="obsTiles">
            <div class="obsTileLabel">
              <p v-if="occurrenceData.totalRecords > occurrenceData.occurrences.length">Latest {{occurrenceData.occurrences.length}} occurrences</p>

              <p v-if="occurrenceData.totalRecords == occurrenceData.occurrences.length">{{occurrenceData.occurrences.length}} occurrences</p>
            </div>

            <ObsTile v-for="o in occurrenceData.occurrences" :key="o.uuid" :obs-data="o" @tilehover="setTileHover" @show-modal="setObsModal"/>

            <div class="obsTileLabel end" v-if="occurrenceData.totalRecords > occurrenceData.occurrences.length">

              <p><a :href="'https://biocache.ala.org.au/occurrences/search?q='+apiState.query+'&lat='+geoFilter.lat+'&lon='+geoFilter.lon+'&radius='+geoFilter.radius" target="_blank" class="newtab">All {{occurrenceData.totalRecords}} occurrences</a></p>
            </div>
          </div>

          <div class="hexbinLegend">
            <div class="chip" v-for="b in mapBins" :style="{'background-color':b.csscol}">
              <span>{{formatBinCount(b.count)}}</span>
            </div>
          </div>

        </div>




<!-- image modal  -->
      <div class="modalWrapper" v-if="modalObs">
          <img :src="modalObs.imageUrl">
        <div class="modalInfo">
          <p><a target="_blank" class="newtab" :href="'https://biocache.ala.org.au/occurrences/'+modalObs.uuid">{{modalObs.vernacularName ? modalObs.vernacularName : modalObs.scientificName }}</a></p>
          <p v-if="modalObs.vernacularName"><em>{{modalObs.vernacularName ? modalObs.scientificName : '' }}</em></p>
          <p class="sub" v-if="modalObs.collector">Observed by {{modalObs.collector[0]}}</p>
          <p class="sub" v-if="modalObs.formattedDate">{{modalObs.formattedDate}}</p>
          <p><span class="close" @click="modalObs=null">×</span></p>
        </div>
      </div>

    </div>



     <section class="viewControl">

      <div class="viewTab" :class="{focus: viewMode=='species'}" @click="viewMode='species'; apiState.switchFilter('data','species')">
        <h3>Discover Species</h3>
        <p>Meet common, distinctive and threatened species</p>
      </div>

      <div class="viewTab" :class="{focus: viewMode=='data'}" @click="viewMode='data'; apiState.switchFilter('species','data')">
        <h3>Explore Data</h3>
        <p>Browse by data facets and relationships</p>
      </div>

    </section>


    <section v-show="viewMode=='species'">
      <speciesRank v-if="viewMode=='species' && geoFilter" :geoFilter="geoFilter" :speciesGroups="speciesGroups" :bubbleSize="360">
      </speciesRank>
    </section>

    <section v-if="viewMode=='species'">
      <speciesSearch></speciesSearch>
    </section>

    <section id="facets" v-show="viewMode=='data'">
      <div class="facet-wrapper" >
        <div class="facetColumn" v-if="occurrenceData" v-for="f in showFacets">
          <facet-group :field="f" :facet-results="occurrenceData.facetResults" :total-count="occurrenceData.totalRecords" :geo-filter="geoFilter"></facet-group>
        </div>
      </div>
    </section>

    <section id="decades" v-show="viewMode=='data'">
      <h4>Decades</h4>
      <div class="timeFacets" v-if="occurrenceData">
       <decadeFacets :facet-results="occurrenceData.facetResults" :geo-filter="geoFilter"></decadeFacets>
      </div>
    </section>

    <Footer/>

</template>


<script>
  export default {
    data() {
      return {  queryParams:{ q:"*",
                  pageSize:100,
                  spatiallyValid:true,
                  qualityProfile:"ALA",
                  sort:"eventDate",
                  dir:"desc",
                  fsort:"count",
                  flimit:200,
                  facets: ["speciesGroup","dataResourceName","countryConservation","decade"]
                },
                showFacets: ["speciesGroup","dataResourceName","countryConservation"],
                occurrenceData:null,
                filterQuery:{}, // storing the facet query state
                queryLoaded: false,
                geoFilter:null,
                apiCache:{},
                userLocation:null,
                gettingUserLocation: false,
                geoLocationError:null,
                //defaultGeoQuery: {lat:-35.704, lon:150.043,radius:50},
                startLocs:[
                  {label: "Grampians", lat:-37.168114938627575, lon:142.4169731140137, radius:11.466733163674808, zoom:11},
                  {label: "Woomera", lat:-30.482116463854545, lon:136.91265106201175, radius:24.814581476607216, zoom:10},
                  {label: "Augusta - SW corner", lat:-34.21148883258428, lon:115.08281707763673, radius:23.81526309920529,zoom:10},
                  {label: "Daintree", lat:-16.09484060306643, lon:145.3829383850098, radius:13.820092175436397, zoom:11}
                  ]
                  ,
                mapZoom: 9,
                initLoc:null,
                mapBeenMoved:false,
                apiState,
                viewMode:"species",
                tileHoverId:null,
                modalObs:null,
                mapBins:null,
                showRecenterButton:false,
                siteRoot: import.meta.env.BASE_URL,

              }

    },

    computed:{
        hexMapQuery(){
          let hq = this.queryParams.q;
          if (this.geoFilter){ // add the geo query fields to the hex map layer
            hq = hq + "&lat=" +this.queryParams.lat +"&lon=" +this.queryParams.lon + "&radius=" + this.queryParams.radius;
          }
          // console.log("hexquery " + hq)
          return hq;
        },
        groupedOccurrences(){
          // add computed speciesGroups to occurences and pass these in
          // so we can have custom icons etc
          let go = this.occurrenceData.occurrences.map(o => {
            let sg;
            if (o.speciesGroups.includes("Plants")) sg = "Plants";
            else if (o.speciesGroups.includes("Fungi")) sg = "Fungi";
            else if (o.speciesGroups.includes("Birds")) sg = "Birds";
            else if (o.speciesGroups.includes("Mammals")) sg = "Mammals";
            else if (o.speciesGroups.includes("Reptiles")) sg = "Reptiles";
            else if (o.speciesGroups.includes("Fishes")) sg = "Fishes";
            else if (o.speciesGroups.includes("Amphibians")) sg = "Amphibians";
            //else if (o.speciesGroups.includes("Amphibians")) {sg = "Frogs"; console.log(o)}
            else if (o.speciesGroups.includes("Fungi")) sg = "Fungi";
            else if (o.speciesGroups.includes("Chromista")) sg = "Kelp";
            else if (o.speciesGroups.includes("Molluscs") || o.speciesGroups.includes("Crustaceans") ) sg = "Molluscs";
            else if (o.speciesGroups.includes("Arthropods") && !o.speciesGroups.includes("Crustaceans") ) sg = "Insects";
            else if (o.speciesGroups.includes("Protozoa") || o.speciesGroups.includes("Bacteria")) sg = "Microbes";
            else if (o.speciesGroups.includes("Animals")) sg = "Inverts"
            o.speciesGroup = sg;
            return o;
          })
          // console.log(go);
          return go;
        },

        tileWrapHeight(){
          return this.$refs.tilewrapper.clientHeight;
        }
    },

    methods: {

      mapInit(){
        this.mapZoom = this.initLoc.zoom;
        this.mapBins = this.$refs.hexmap.mapBins;
      },

      queryApi(){
        this.queryLoaded = false;
        // check if we have stored data in the cache, use it if so
        if (this.apiCache[this.queryParams.q]){
          this.occurrenceData = this.apiCache[this.queryParams.q]
          this.queryLoaded = true;
          console.log("loaded from cache " + this.queryParams.q)
          return;
        }

       axios
        .get('https://api.ala.org.au/occurrences/occurrences/search?',
          {params:this.queryParams,
          paramsSerializer: {
            indexes: null, // serialise the array value (facets)
          }})
        .then((response) => {
          this.occurrenceData = response.data;
          this.apiCache[this.queryParams.q] = response.data;
          this.queryLoaded = true;
        })
      },

      setGeoFilter(geofilter){
        this.apiCache = {}; // clear cache when geoFilter set
        this.queryParams.lat = geofilter.lat
        this.queryParams.lon = geofilter.lon
        this.queryParams.radius = geofilter.radius;
        this.geoFilter = {lat: geofilter.lat, lon:geofilter.lon, radius: geofilter.radius };
        this.queryApi();
      },

      async getLocation() {
        return new Promise((resolve, reject) => {
          if(!("geolocation" in navigator)) {
            reject(new Error('Geolocation is not available.'));
          }
          navigator.geolocation.getCurrentPosition(pos => {
            resolve(pos);
          }, err => {
            reject(err);
          });
        });
      },

      async locateMe() {
        this.gettingUserLocation = true;
        try {
          this.gettingUserLocation = false;
          this.userLocation = await this.getLocation();
          let mapradius = this.$refs.hexmap.getViewRadius();

          this.setGeoFilter({lat: this.userLocation.coords.latitude, lon: this.userLocation.coords.longitude, radius:mapradius })
          // zoom the map to the filter location
          console.log("geolocation, fit radius")
          this.$refs.hexmap.localCenter = {lat: this.userLocation.coords.latitude, lng: this.userLocation.coords.longitude}
          this.$refs.hexmap.localRadius = mapradius;
          this.$refs.hexmap.fitRadiusBounds();


        } catch(e) {
          this.gettingUserLocation = false;
          this.geoLocationError = e.message;
        }
      },

      formatCount(count){
            if (count < 10000) return count;
            if (count >= 10000 && count < 1000000) return Math.floor(count/1000)+"k";
            return (count/1000000).toFixed(1)+ "M";
      },

      formatBinCount(count){
            if (count < 1000) return count;
            if (count >= 1000 && count < 10000) return (count/1000).toFixed(1)+"k";
            if (count >= 10000 && count < 1000000) return Math.floor(count/1000)+"k";
            return (count/1000000).toFixed(1)+ "M";
      },

      setTileHover(id){
        if (id != this.tileHoverId) {
          this.tileHoverId = id;
          this.$refs.hexmap.bounceMarker(id)
        }
      },

      setObsModal(obs){
        this.modalObs = obs;
      },

      updateMapBins(bins){
        this.mapBins = bins;
      }
     },

    mounted(){
      let randomIdx = Math.floor(Math.random()*this.startLocs.length);
      this.initLoc = this.startLocs[randomIdx]
      this.setGeoFilter(this.initLoc); // load with default geo query
    },

    watch: {
      'apiState.query'(globalQuery){ // watching the global state
        this.queryParams.q = globalQuery;
        this.queryApi()
      }
    }


  }

</script>

<style type="text/css">

  section{
    display: block;
    clear: both;
  }
  #facets, #decades, .content-wrapper{
    padding:0 1em;
    max-width:1100px;
    margin:0 auto;
    overflow-x: hidden;
  }

  .landing{
    text-align: center;
    padding-bottom:2rem;
  }

  .landing h1{
    font-size:4rem;
    margin:2rem 0 0.5rem;
    line-height: 0.9em;
  }

  .title-logo{
    height: 1.0em;
    display: inline-block;
    position: relative;
    top: 0.15em;
/*    left: 0.15em;*/
    margin-right:0.25em;
    margin-left:0.25em;
  }

  h1 span.logotype{
    white-space: nowrap;
  }

  .landing h2{
/*    color:var(--ala-orange);*/
    font-size:2.0rem;
    font-weight: 600;
    margin:4rem 0 1rem;
  }

  .landing h2.tagline{
    color:var(--ala-black);
    font-weight: 500;
    margin:0.5rem 0 1rem;
  }

  .landing .image-credits{
    font-size: 0.8rem;
    color:var(--ala-darkgrey);
  }

  .landing h4{
    font-weight: 400;
    font-size:1.3rem;
    margin:1rem auto;
    max-width: 800px;
  }


  .landing button{
    font-size:1.25rem;
    font-weight:500;
    padding:0.75rem 1.5rem;
    background-color: white;
    border: 1px solid var(--ala-orange);
    border-radius: 0.5rem;
    margin:0.5rem;
    cursor:pointer;
  }

  .landing button:hover{
    background-color: var(--ala-flamingo);
  }

  .landing button:active{
    background-color: var(--ala-orange);
    color:white;
  }

  .landing img.landing-bubble{
  width:450px;
    max-width:100%;
    margin:1rem auto;
    flex:2;
  }

  .landing .intro-wrap{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin:0 auto;
    max-width:900px;
    align-items: center;
    gap:1rem;
  }

  .landing .intro-wrap .intro-text{
    flex:1;
    font-size: 1.2rem;
    text-align: left;
    flex-grow: 1;
  }

  .ds-tile-wrap{
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: center;
    margin-top:2rem;
  }

  a.ds-tile{
/*    display: block;*/
    width:25%;
    min-width:240px;
/*    background-color: var(--ala-concrete);*/
    margin:1rem;
    padding:1rem;
    border-radius: 1rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.5s;
    text-decoration: none;
    border: 1px solid var(--ala-orange);



  }

  .ds-tile:hover{
    background-color: var(--ala-light-orange);
  }

  a.ds-tile p{
    margin-top:0.5rem;
    color:var(--ala-black);
  }

  .ds-tile img{
    height:40px;


  }

  a.ds-tile h4{
    font-size:1.4rem;
    font-weight: 500;
    text-decoration: none;
    margin:0.5rem;
  }



  .facetColumn{
    width:33%;
    float:left;
    display: inline-block;
  }

  .mapWrapper{
    position:relative;
    height:65vh;
  }

  .dsLink{
    display: inline-block;
    margin: 2rem;
  }

  .hexbinLegend{
    position:absolute;
    top:-2.1rem;
    right:0.5rem;
    z-index:10000;
    display: flex;
/*    flex-direction: row;*/
    background-color: white;
    padding: 1.0rem 0.25rem 0.25rem;
    border-radius:3px;
    box-shadow:0px 0px 3px rgba(0,0,0,0.2);
  }

  .hexbinLegend .chip{
    width:1.5rem;
    height:0.5rem;
    display: block;
  }

  .hexbinLegend .chip span{
    display: inline;
    width:1.5rem;
    font-size: 0.66rem;
    position: relative;
    text-align: center;
    left:0.75rem;
    top:-1.2rem;
    color:var(--ala-darkgrey);

  }

  .hexbinLegend .chip:last-of-type span{
    display: none;
  }

  .modalWrapper{
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    z-index:30000;
    background-color: rgba(0,0,0,0.9);
    display: flex;
    flex-direction: column;
    padding:2rem;
    box-sizing: border-box;
    justify-content: center;
  }

  .modalWrapper .imgWrapper{
    position:relative;
    top:10%;
    left:10%;
    height:60%;
    width:80%;
  }

  .modalWrapper img{
    object-fit:contain;
    display: block;
    margin:0 auto;
    max-width: 90%;
    max-height: 70%;
    background-color: #212121;
    border-radius: 1rem;
  }

  .modalWrapper span.close{

    font-size: 2.5rem;
    color:white;
    cursor: pointer;
    padding-top:0.5rem;
    display: inline-block;

  }

  .modalWrapper span.close:hover{
    color:var(--ala-orange);
  }

  .modalInfo{
    color:white;
    width:50%;
    min-width: 320px;
    margin:0 auto;
    margin-top:2rem;
  }

  .modalInfo p{
    text-align: center;
    line-height: 1.1em;
    font-size:120%;
    margin:0.25rem 0;
    }

    .modalInfo p.sub{
      color: var(--ala-lightgrey);
      font-size: 100%;
    }

  .obsTileWrapper{

    position:absolute;
    width:100%;
    z-index:9999;
    bottom:0;
    overflow: visible;
  }

  .obsTiles{

    display:flex;
    flex-wrap: nowrap;
    overflow-x: scroll;

    padding-bottom:0.6em;
    padding-top:0.2rem;


  }

  .obsTileLabel{
    height: 76px;
    margin: 0 0.25em 0 0;
    background: var(--ala-orange);
    box-sizing: border-box;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.2);
    padding: 0.25em 1.0em 0.25em 0.5em;
    text-wrap: wrap;
    font-size: 1.0rem;
    font-weight: 500;
    text-align: center;
    color: white;
  }

  .obsTileLabel.end{
    background: white;
    text-align: left;
    margin-left:0.25em;
    margin-right:0;
    font-size:0.8em;
  }

  .obsTileLabel.end a{
/*    padding-right:0.5rem;*/
  }


  .focusInfoBar{
    width:100%;
    background-color: var(--ala-orange);
    padding:0.25rem;
    box-sizing: border-box;
    position:sticky;
    top:0;
    z-index:99999;
    height:2.9rem;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);
  }

  .obsCountWrapper{
    position:absolute;
    right:0;
    display: inline-block;
    padding-right:0.5rem;
    text-align: center;
/*    height:60px;*/
  }

  .obsCountWrapper h4{
    display: inline-block;
/*    background-color: var(--ala-black);*/
    color: white;
    font-weight: 600;
    margin: 0.25rem 0 0;
    padding: 0.05rem 0.5rem 0rem;
    border-radius: 0.75rem;
  }

  .obsCountWrapper .countLabel{
    display: block;
    font-size:0.7rem;
    margin:0;
    padding:0;
    line-height: 0.5rem;
    font-weight: 500;
    color: white;

  }


 .filterTagWrapper{
  width:90%;
  display:flex;
 }


  .filterTag{
    display: inline;
    background-color: white;
    padding: 0 0 0 0.25rem;
    position: relative;
    height:2.25rem;

    margin: 0 0.5rem 0 0;
    border-radius: 0 0.3rem 0.3rem 0;

    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.2);
    font-weight: 400;

    border: 0.5px solid rgba(0,0,0,0.2);
    min-width:60px;
  }

  .filterTag .label{
    position: relative;
    display: inline-block;
    white-space: nowrap;
    padding: 0 1.5rem 0 0;
    margin: 0;
    top: -0.18rem;
    font-size: 0.65rem;
    letter-spacing: -0.01rem;
/*    font-weight: 300;*/
/*    font-style: italic;*/
    color:var(--ala-darkgrey);

  }

  .filterTag .value{
    font-size: 0.8rem;
    margin: 0 0.5rem 0.2rem 1rem;
    /* line-height: 1rem; */
    /* padding-top: 1.0rem; */
    /* text-align: right; */
    display: block;
    position: relative;
    bottom: 0.1rem;
  }

  .filterTag.group .value{
    margin-left:0;
  }

  .filterTag .close{
    position:absolute;
    right: 0.2rem;
    top: -0.1rem;
    font-weight: 300;
    cursor:pointer;
  }

  .filterTag .close:hover{
    color:var(--ala-orange);
  }

  .filterTag .groupIcon{
    width:16px;
    max-height:16px;
    display: inline-block;
    vertical-align:bottom;
    margin:0 0.1rem;

  }


/*  info link button */
  .speciesInfo img{
    width:14px;
    height:14px;
    margin-left: 0.25rem;
    vertical-align: bottom;

  }

  section.viewControl{
/*    margin-top:3rem;*/
    margin-top:0;
    padding: 0 1rem;
    background-color: var(--ala-black);
    border-bottom: 0.25rem solid var(--ala-orange);
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
  }

  button.chooseViewButton{
    background-color: white;
    font-size: 1.1rem;
    border:1px solid var(--ala-orange);
    padding:0.5rem 0.3rem;
    border-radius: 0.25rem;
    margin:0 0.5rem;
    color:var(--ala-charcoal);
    cursor:pointer;
  }

  button.chooseViewButton.focus{
    background-color: var(--ala-light-orange);
  }

  .viewTab{
    color:var(--ala-concrete);
    background-color: var(--ala-darkgrey);
    width:30%;
    max-width:360px;
    margin: 0.5rem 0.5rem 0 0.5rem;
    text-align: center;
    padding: 0.5rem 0.5rem 0 0.5rem;
    cursor:pointer;
    flex:1;
  }

  .viewTab:hover{
    color:white;
    background-color: var(--ala-dark-orange);
  }

  .viewTab.focus{
    background-color: var(--ala-orange);
    color:white;
  }

  .viewTab h3{
    font-weight: 500;
    margin:0;
    font-size:1.2rem;
  }

  .viewTab p{
    font-size: 0.8rem;
    margin-top:0.25rem;
    line-height: 0.9em;
  }

    @media only screen and (max-width: 600px) {

      .filterTagWrapper .filterTag{
        max-width:80px;
        transition:width 0.5s;
      }

      .filterTagWrapper .filterTag p.value{
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

      }

      .filterTagWrapper .filterTag:hover{
        width:unset;
      }

      .viewTab p{
        display: none;
      }

      .viewTab h3{
        margin-bottom:0.5rem;
      }

      section.viewControl{
        padding:0 0.25rem;
      }

      section.viewControl .viewTab{
        margin:0.5rem 0.25rem 0;
      }



      section#facets{
        overflow-x: scroll;
      }

    /*  make facets overflow to enable swiping    */
      .facet-wrapper{
        width:240vw;
        position:relative;
        transition:left 0.5s;
      }

    }



</style>




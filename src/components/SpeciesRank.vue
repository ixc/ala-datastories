<template>

	<div class="section-wrapper">
		<div class="lifeform-wrapper" v-if="lifeformMode !== 'none'">

			<h4>Lifeform</h4>
			<div class="filterTag sgSelect" @click="setSpeciesGroupFilter({value:'All'})"
			:class="{focus: speciesGroupFilter.value == 'All'}">

              <p class="value">All</p>
            </div>

			<div class="filterTag sgSelect" v-for="s in filteredSpeciesGroups"
			@click="setSpeciesGroupFilter(s)"
			:class="{focus: speciesGroupFilter.label == s.label}">

             <p class="value">
             	<img v-if="s.icon" class="groupIcon" :src="`${siteRoot}/icons/${s.icon}`" alt=""/>
             {{s.label}}</p>
            </div>

		</div>

		<div class="speciesBubble">

			<h4>Common Species</h4>

			<BubbleLayout :species-data="localRanks" :bubbleCount="10" :size="bubbleSize"></BubbleLayout>

			<p class="explainer">Most frequently observed</p>

			<p class="deeplink"><a class="newtab" target="_blank"
				:href="'https://biocache.ala.org.au/occurrences/search?q='+apiState.query+'&lat='+geoFilter.lat+'&lon='+geoFilter.lon+'&radius='+geoFilter.radius">
			All species</a>
			</p>
		</div>

		<div class="speciesBubble">

			<h4>Distinctive Species</h4>

			<BubbleLayout :species-data="distinctiveRanks" :bubbleCount="10" :size="bubbleSize"></BubbleLayout>

			<p class="explainer">Observed<br/>more often in this area</p>

		</div>

		<div class="speciesBubble">

			<h4>Threatened Species</h4>

			<BubbleLayout :species-data="conservationSpecies" :bubbleCount="10" :size="bubbleSize"></BubbleLayout>

			<p class="explainer">In national lists</p>

			<p class="deeplink">
				<a class="newtab" target="_blank"
				:href="'https://biocache.ala.org.au/occurrences/search?q='+apiState.query+'&fq=countryConservation:*&lat='+geoFilter.lat+'&lon='+geoFilter.lon+'&radius='+geoFilter.radius">All threatened species</a>
			</p>

		</div>

		<div class="rank-footer" v-show="false">
				Distinctiveness mode: <select v-model="distMode">
				<option value="rank">Rank</option>
				<option value="freq">Frequency</option>
			</select>
			<label for="stateCons">State Conversation Status</label><input id="stateCons" type="checkbox" v-model="useStateConservationStatus">
			<label for="nationalCons">National Conversation Status</label><input id ="nationalCons" type="checkbox" v-model="useNationalConservationStatus">
		</div>

	</div>


</template>

<script>
	import globalRankData from '../assets/data/occurrencerank-50k-total.json'
	import BubbleLayout from '../components/BubbleLayout.vue'
	import { apiState } from '../apiState.js'
	import { getLifeformMode, getLifeformAllowList } from '../apiConfig.js'
	import axios from 'axios'
	import * as d3 from 'd3'

	export default {
		components: {
	      BubbleLayout
	    },

		data(){
			return {
				globalRanks: globalRankData.ranks,
				// Map for speedy lookup
				globalRankMap: new Map(globalRankData.ranks.map((r) => [r.lsid, r])),
				globalTotal: globalRankData.totalRecords,
				localRanks:[],
				localTotal: 0,
				distinctiveSpecies:[],
				topLocalSpecies:[],
				conservationSpecies:[],
				speciesCount: 1000,
				speciesGroupFilter: {value:"All"},
				lifeformMode: getLifeformMode(),
				lifeformAllowList: getLifeformAllowList(),
				// minimum fraction of total local occurrences, for a species to be shown as distinctive
				distinctiveMinFraction: 0.001,
				numLocalSpecies: 10,
				speciesLoaded: false,
				conservationSpeciesLoaded:false,
				distMode:"rank",
				apiState,
				useStateConservationStatus:false,
				useNationalConservationStatus:true,
				siteRoot: import.meta.env.BASE_URL
			}
		},

		computed: {

			filteredSpeciesGroups(){
				if (this.lifeformAllowList) {
					return this.speciesGroups.filter(s => this.lifeformAllowList.includes(s.id))
				}
				return this.speciesGroups
			},

			distinctiveRanks(){
				let dr = this.localRanks.map((s,r) =>{
					let globalMatch = this.globalRankMap.get(s.lsid);
					let deltaRank;
					let inverseFreq = 0;
					let globalRank = -1;
					if (globalMatch){
						deltaRank = globalMatch.rank - r; // crude!
						globalRank = globalMatch.rank
						inverseFreq = s.localFreq / (globalMatch.count/this.globalTotal)
					} else {
						deltaRank = this.globalRanks.length - r
					}
					return {...s, deltaRank:deltaRank, globalRank: globalRank, relativeFreq: inverseFreq}
				});
				dr = dr.filter(s => s.localFreq > this.distinctiveMinFraction);
				let sorted;
				if (this.distMode == "rank") sorted = dr.sort((a,b) => { return b.deltaRank - a.deltaRank})
				if (this.distMode == "freq") sorted = dr.sort((a,b) => { return b.relativeFreq - a.relativeFreq})
				return sorted;

			}

		},

		watch: {
			geoFilter(){
				this.getLocalSpeciesAsync();
				this.getLocalSpeciesAsync("conservation");
			},

			'apiState.query'(){
				// empty filters after a speciesGroup has been removed
				if (apiState.filters.length == 0){
					this.speciesGroupFilter = {value:'All'}
					this.getLocalSpeciesAsync();
					this.getLocalSpeciesAsync("conservation");
				}
			}
		},

		props: ['geoFilter','speciesGroups','bubbleSize'],

		methods: {

			setSpeciesGroupFilter(f){
				this.speciesGroupFilter = f;
				if (f.value == "All"){
					apiState.clearFilter();
					return;
				}

				apiState.setFilter({field:'speciesGroup', fieldLabel:'Lifeform',value: f.label, valueLabel: f.label, fq:f.fq, icon:f.icon})
				this.getLocalSpeciesAsync();
				this.getLocalSpeciesAsync("conservation");
			},

			async getLocalSpeciesAsync(conservationQuery) {
				this.conservationSpeciesLoaded = false;
				this.speciesLoaded=false;
				let qparams = {
					q: "* AND taxonRank:species",
					lat: this.geoFilter.lat, //this.queryLat,
					lon: this.geoFilter.lon, //this.queryLon,
					radius: this.geoFilter.radius, //this.queryRadius,
					facets: 'names_and_lsid',
					qualityProfile:'ALA',
					flimit: this.speciesCount
				}

				if (this.speciesGroupFilter.value != "All"){
					qparams.q = "* AND " + this.speciesGroupFilter.fq + " AND taxonRank:species"
				}

				if (conservationQuery){ // modify for conservation species lists
					qparams.q += " AND (countryConservation:*)";
					qparams.flimit = this.numLocalSpecies; // only load 10 species
				}

			    try {
			    	const base = 'https://api.ala.org.au/occurrences/occurrences/search?';
			      	const response = await axios.get(base,{params: qparams})

			      	// conservation species query
			      	if (conservationQuery){
			      		if (!response.data.facetResults[0]) {
			      			this.conservationSpecies = [];
			      			return;
			      		} else {
			      			this.conservationSpecies = response.data.facetResults[0].fieldResult.map(r => {
			      					let bits = r.label.split("|");
			      					return {name:bits[0], commonName: bits[2], lsid:bits[1], count: r.count}
								});
			      		}
			      		this.conservationSpeciesLoaded = true
			      	} else {
			      		this.localTotal = response.data.totalRecords
				  		this.localRanks = response.data.facetResults[0].fieldResult.map(r => {
							let bits = r.label.split("|");
							return {name:bits[0], commonName: bits[2], lsid:bits[1], count: r.count, localFreq: r.count/this.localTotal}
						});
						this.speciesLoaded = true;
			      	}
				} catch (error) {
			      console.error(error)
			    }
			  }


		},

		mounted(){
			let gf = this.apiState.filterState.speciesGroup
			if (gf){
				this.speciesGroupFilter = {value:gf.value, label:gf.valueLabel, fq:gf.fq}
			}
			this.getLocalSpeciesAsync();
			this.getLocalSpeciesAsync("conservation");
		}

	}
</script>


<style>
	.section-wrapper{
		padding:0 1rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		gap:1rem;

	}

	.lifeform-wrapper{
		margin:0.5rem auto;
		width:100%;
		padding-bottom: 0.5rem;
		font-size:90%;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: flex-end;
	}

	.lifeform-wrapper h4{
		margin-right:0.5rem;
	}

	.rank-footer select{
		margin-right:2rem;
	}

	/* When no .lifeform-wrapper is shown, add top padding to bubbles */
	.section-wrapper > .speciesBubble:first-child,
	.section-wrapper > .speciesBubble:first-child ~ .speciesBubble {
		margin-top: 3.5rem;
	}

	.speciesBubble{
		min-width:360px;
		padding:0;
		margin-bottom:2rem;
		position:relative;
		flex:1;
		flex-grow:0;
		flex-shrink:1;
	}

	.speciesBubble h4{
		position:absolute;
		top:0;
		margin:0;
		font-size: 1.0rem;
		width:90px;
	}

	.speciesBubble .explainer{
		position:absolute;
		bottom:0;
		left:0;
		width:80px;
		font-size:0.7rem;
		line-height: 1.0em;
		color:var(--ala-darkgrey);
	}

	.speciesBubble .deeplink{
		position:absolute;
		bottom:0;
		right:0;
		width:80px;
		font-size:0.7rem;
		line-height: 1.0em;
		text-align: right;
	}


	.bubbleLayout{
		position:relative;
	}

	.bubbleLayout .bubble-wrapper{
		position:absolute;
	}

	.bubbleLayout .bubble-wrapper.root {

	}

	.filterTag.sgSelect{

		padding: 0.4rem 0.5rem 0.15rem 0.25rem;
		border-color: var(--ala-darkgrey);
		border-width:0.5px;
		cursor: pointer;
		opacity:0.7;
		margin: 0 0.25rem 0.25rem 0;
		height: unset;


	}

	.filterTag.sgSelect.focus{
		border-color: var(--ala-orange);
		background-color: var(--ala-light-orange);
		opacity:1.0;
	}

	.filterTag.sgSelect:hover{
		border-color: var(--ala-orange);
		background-color: var(--ala-light-orange);
	}

	.filterTag.sgSelect p.value{
		margin-left:0;
		margin-bottom:0;
		font-size: 90%;
		padding-top:0;

/*		color: var(--ala-darkgrey);*/

	}

	.filterTag.sgSelect p.label{
		font-size: 70%;
	}

	.sgSelectLabel{
		margin:0;
	}





</style>

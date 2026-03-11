<template>
	<nav v-if="!extraFq">
		<div class="ala-logo">
			<a href="https://ala.org.au">
				<img src="@/assets/img/ALA_Logo_Inline_REV-RGB.png" alt=""/>
			</a>
		</div>

		<div class="ala-logo-mobile">
			<a href="https://ala.org.au">
				<img src="@/assets/img/ALA_Logo_Mark-only.png" alt=""/>
			</a>
		</div>

		<div class="lens-logo">
			<a :href="homePath">ALA<img src="@/assets/img/lens.svg" alt="">Lens</a>
		</div>

		<div class="ds-menu dropdown-toggle"><a href="#" @click="dropDown">Data Stories</a>
			<ul v-if="dropDownActive">
				<li><a :href="homePath+'/data-stories/digging-into-data/'">Digging Into Data</a></li>
				<li><a :href="homePath+'/data-stories/threatened-species/'">Threatened Species</a></li>
				<li><a :href="homePath+'/data-stories/seasonal-change/'">Seasonal Change</a></li>
			</ul>
		</div>
	</nav>
</template>

<script>
import { extraFq } from '../apiConfig.js'

export default {

  name: 'Menu',

  props: ['homePath'],

  data () {
    return {
    	dropDownActive:false,
    	extraFq,
    }
  },

  methods:{
  	dropDown(){
  		this.dropDownActive = !this.dropDownActive;
  	}
  }
}
</script>

<style lang="css" scoped>

	nav{
		background-color: var(--ala-black);
		width:100%;
		padding:1rem;
		color: white;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		font-size:1.2rem;
		box-sizing: border-box;
	}

	nav a, nav a[href] {
		text-decoration: none;
		color:white !important;
		transition:color 0.5s;

	}

	nav a:hover, nav a:active{
		color:var(--ala-flamingo) !important;
	}

	.ala-logo{
/*		height:36px;*/
		width:240px;
		margin-right:2rem;
/*		max-width:20%;*/
	}

	.ala-logo-mobile{
		width:36px;
		margin-right:1rem;
		display: none;
	}

	.ala-logo img, .ala-logo-mobile img{
		height:100%;
		width:100%;
		fit-content:contain;

	}


	.lens-logo{
		margin-right:2rem;
		font-size: 1.3rem;
		white-space: nowrap;
	}

	.lens-logo a{
		display: inline-block;
	}
	.lens-logo img{
		height:24px;
/*		margin-right:0.5rem;*/
		margin:0 0.25em;
		vertical-align: text-bottom;

	}

	.ds-menu{
		margin-left:auto;
		position:relative;
	}

	.ds-menu ul{
		list-style: none;
		padding:0;
		margin:0;
		display: block;
		position:absolute;
		right:-1rem;
		top:100%;
		background-color: var(--ala-black);
		width:200px;
		padding:1rem 0;
		z-index:1;
	}

	.ds-menu ul li{
		display: block;
		padding:0.5rem 1rem 0.5rem 0.5rem;
		text-align: right;
		font-size: 1.1rem;
	}

	.dropdown-toggle::after {
	    display: inline-block;
	    margin-left: .35em;
	    vertical-align: .255em;
	    content: "";
	    border-top: .3em solid;
	    border-right: .3em solid rgba(0, 0, 0, 0);
	    border-bottom: 0;
	    border-left: .3em solid rgba(0, 0, 0, 0);
	}


    @media only screen and (max-width: 600px) {

     .ala-logo{
     	display: none;
     }

     .ala-logo-mobile{
     	display: block;
     }

    }



</style>

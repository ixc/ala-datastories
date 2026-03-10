<script setup>
    import Menu from '../../components/Menu.vue'
    import Footer from '../../components/Footer.vue'
    import drTimeline from '../../assets/data/drTimelineUnflat.json'
    
    import gangGangData from '../../assets/data/ggDecimated.json'
    import ausStates from '../../assets/data/aus-states.json'
    import iNatGangGangData from '../../assets/data/iNatGangGangs.json'
    import axios from 'axios'
    import * as d3 from 'd3'
</script>

<template>

<Menu home-path="../.."/>
<div class="datastory-outer">
  <div class="datastory-wrapper">


    <h1>Digging into Data</h1>

    <p class="intro">The Atlas of Living Australia contains millions of observations of living things, recorded as data. This story uses visualisation to dig into where this data comes from and how it's created; it's a good place to start to explore what the ALA is made of.</p>


    <section>
      <!-- DATA RESOURCES -->
      <h2>Data Resources</h2>


      <p>The ALA aggregates data from {{dataResources.length}} different data resources. They vary massively in size, from giants like eBird with over 50 million observations, to small local projects Just their names tell us a lot about how data in the ALA is made. Browse and filter this list to get an impression of the range and scale of data resources.</p>

      <p class="interactionTip">Among other things you can search for types of creature (eg <span class="sample-query" @click="drFilter='fish'">fish</span>) or organisations (<span class="sample-query" @click="drFilter='museum'">museum</span>, <span class="sample-query" @click="drFilter='CSIRO'">CSIRO</span>), or places (<span class="sample-query" @click="drFilter='NSW'">NSW</span>). Click on a resource name to explore it in the ALA.</p>

      <label for="drfilter">Filter by: </label>
      <input type="text" v-model="drFilter" id="drfilter">

      <div class="data-table-wrapper" v-if="drLoaded">
        <table>

       

        <tbody>
             <tr>
            <th>Name</th>
            <th>Observations</th>
          </tr>
          <tr v-for="r in filteredResourceTable">
            <td>
              <div class="data-table-bar" :style="{width: drScale(r.count)+'%'}"></div>
              <a :href="`https://collections.ala.org.au/public/show/${r.i18nCode.split('.')[1]}`" target="_blank">{{r.label}}</a>
            </td>
            <td>{{r.count.toLocaleString()}}</td>
          </tr>
        </tbody>
          <tfoot>
            <tr>
              <td>
              
                <span class="tick" v-for="t in drTicks" :style="{left: drScale(t.v)+'%'}">{{t.t}}</span>
              
              </td>
              <td></td>
            </tr>
          </tfoot>
          </table>
        </div>

    </section>

    <section>
      <!-- DR TIMELINE -->
      <h2>Data Resources Over Time</h2>
      
      <p>This graph shows the number of records in data resources over time. It shows how some resources span many decades, while others are generated in short period. Museum collections have records from long ago, while citizen science resoures like iNaturalist have grown rapidly in recent years. </p>

      <p class="interactionTip">Use the search box to filter the records, just like the table above. For eaxmple try <span class="sample-query" @click="tlFilter='insect'">insect</span>, <span class="sample-query" @click="tlFilter='frog'">frog</span>, <span class="sample-query" @click="tlFilter='waterbird'">waterbird</span>, <span class="sample-query" @click="tlFilter='Queensland'">Queensland</span> or <span class="sample-query" @click="tlFilter='herbarium'">herbarium</span></p> 
      
      <label for="tlfilter">Filter by: </label>
      <input type="text" v-model="tlFilter" id="tlfilter">

      <div class="drTimeline"> 
        <!-- TIMELINE -->
        <div class="tlrow" v-for="t in filteredResourceTimeline.slice(0,20)">
          <span class="rowlabel">{{t.facet}}</span>
          <div class="tlcell" v-for="y in t.years" :style="{left: tlPosition(y.label), backgroundColor: timelineConfig.color(timelineConfig.logscale(y.count)), width: timelineConfig.cellwidth+'%'}">
          </div>
        </div>

        <div class="tlrow">
          <div class="tlcell tick" v-for="t in timelineConfig.ticks" :style="{left: tlPosition(t)}">{{t}}</div>
        </div>
      </div>
    </section>

    <section>
      <h2>Data Resources in Space</h2> 

        <p>This map shows observations of <a target="_blank" class="newtab inline" href="https://bie.ala.org.au/species/https:/biodiversity.org.au/afd/taxa/6c646af8-06fb-40ae-83aa-3dd001cc4ea6#overview">Gang-Gang Cockatoos</a> <em>(Callocephalon fimbriatum)</em>, colour-coded by data resource. Notice the different spatial distributions of the data resources?</p>

        <p class="interactionTip">Click the resources to hide or show their observations, and explore the relationships between data resources and locations.</p>

        <div class="ggMapWrap">
          <canvas id="ggMap" width="1600" height="1200"></canvas>
          
        </div>
        <div class="ggMapWrap">
          <button v-for="r in ggDataResources" class="ggMapSelect" 
          @click="toggleShowResource(r)" :class="{show:r.show}">
          {{r.dr}} 
            <span class="chip" :style="{backgroundColor: r.col}"></span>
          </button>
        </div>


    </section>

    <section>
      <h2>Observing Gang-gangs</h2>

      <p>Much of the ALA's data is created through observation. But so far the data hasn't been able to tell us much about the experience of the observer. Here we look at observations from the citizen science platform iNaturalist, which enables observers to record notes or comments with their sightings. This word cloud is created from comments in 851 gang-gang observations.</p> 

      <p class="interactionTip">Click on a term to see comments that include that term; click on a comment to see details of that observation</p>

      <div class="ggCloud">
          <button v-for="w in ggWordTable" :style="{fontSize: 4 + 1.5*Math.sqrt(w.count)+'px'}" @click="ggCloudWord = w.word" :class="{focus: w.word == ggCloudWord}">{{w.word}}</button>
      </div>

      <h4 v-if="ggCloudWord">{{ggComments.length}} Comments including "{{ggCloudWord}}"</h4>
      <div style="columns: 4 150px; column-gap:6px" v-if="ggCloudWord">

        <p v-for="c in ggComments" class="ggComment">
          <a :href="'https://biocache.ala.org.au/occurrences/'+c.uuid" target=_blank>{{c.collector ? c.collector[0] : "Unnamed observer"}}</a>: {{c.raw_occurrenceRemarks}}
        </p>
      </div>

    </section>





  </div>
</div>

<Footer />
</template>

<script>

    export default{
      data(){
        return {
          drFilter:"",
          drScale:d3.scaleSqrt([1,50000000],[0,100]),
          drTicks: [{v:1,t:1},{v:100000,t:'100k'},{v:1000000,t:'1M'},{v:5000000,t:'5M'},{v:10000000,t:'10M'},{v:20000000,t:'20M'}],
          dataResources:[],
          drLoaded:false,
          drTimeline,
          gangGangs: gangGangData,
          d3:d3,
          tlYears:[1800,2022],
          tlFilter:"Museum",
          ggDataResources:[],
          iNatGangGangs: iNatGangGangData,
          ggCloudWord:""
        }
      },

      computed: {

        filteredResourceTable(){
          return this.dataResources.filter(d => d.label.toLowerCase().includes(this.drFilter.toLowerCase()))
        },

        resourceBoxes(){
          return this.filteredResourceTable.map(f => {
                let h = 2;
                if (f.count < 1000) h = 1;
                if (f.count > 1000) h = 2;
                if (f.count > 10000) h = 3;
                if (f.count > 100000) h = 4;
                if (f.count > 500000) h = 8;
                if (f.count > 20000000) h = 16;

                let m = 1; // margin
                let vscale = 6;
                let minPercent = 0.5;
                let b = {...f};
                b.width = Math.max(minPercent,f.count/(25000*h));
                b.height = h*vscale + ((h-1)*m);
                return b
                })
        },

        filteredResourceTimeline(){
           return this.drTimeline.filter(d => d.facet && d.facet.toLowerCase().includes(this.tlFilter.toLowerCase()))
        },

        timelineConfig(){
          let t = {};
          t.years = d3.range(this.tlYears[0],this.tlYears[1]); // all the years
          t.color = d3.scaleSequential(d3.interpolateOrRd);
          t.cellwidth = 100 / (this.tlYears[1] - this.tlYears[0]) 
          let max = d3.max(this.filteredResourceTimeline.map(r => d3.max(r.years ? r.years.map(y => y.count) : [])))
          t.logscale = d3.scaleSqrt([0,max],[0,1]);
          t.ticks = t.years.filter(y => y%20 == 0)
          return t;
        },

        ggWordTable(){
          const stopwords = new Set("i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(","))

          const obsRemarks = this.iNatGangGangs.filter(o => o.raw_occurrenceRemarks).map(o => o.raw_occurrenceRemarks);
          const allwords = obsRemarks.join(" ").split(/[\s.]+/g)
            .map(w => w.replace(/^[“‘"\-—()\[\]{}]+/g, ""))
            .map(w => w.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, ""))
            .map(w => w.replace(/['’]s$/g, ""))
            .map(w => w.substring(0, 30))
            .map(w => w.toLowerCase())
            .filter(w => w && !stopwords.has(w))
            .filter(w => w.length > 2)
          const wordSet = [...new Set(allwords)]
          const wordTable = wordSet.map(w => { return {word:w,count: allwords.filter(a => a==w).length }})
          const filterTable = wordTable.filter(w => w.count > 30).sort((a,b) => a.word.localeCompare(b.word))
          return filterTable;
        },

        ggComments(){
        return this.iNatGangGangs.filter(o => o.raw_occurrenceRemarks && o.raw_occurrenceRemarks.includes(this.ggCloudWord));
        }

      },

     

      methods:{

        loadDataResources(){
          axios.get('https://api.ala.org.au/occurrences/occurrences/facets?',{params:{q:'*',facets:'dataResourceUid',flimit:2000,fsort:'count',qualityProfile:'ALA'}})
          .then((response) => {
            console.log(response.data)
            this.dataResources = response.data[0].fieldResult;
            this.drLoaded=true;
          })

        },

         buildCanvasMap(mapwidth,mapheight){
          const staticProj = d3.geoMercator()
                      .center([143.5,-33.5])
                      .scale(3500)
                      .translate([800/4,110]);
          this.vueCanvas.globalAlpha = 1;
          this.vueCanvas.lineWidth = 1;
          // this.vueCanvas.canvas.style.maxWidth = "100%";
          this.vueCanvas.lineJoin = "round";
          this.vueCanvas.lineCap = "round";
          this.vueCanvas.fillStyle = '#444'; 
          this.vueCanvas.rect(0,0,mapwidth,mapheight);
          this.vueCanvas.fill();
          const pathGenerator = d3.geoPath().projection(staticProj).context(this.vueCanvas);
           this.vueCanvas.beginPath();
          pathGenerator(ausStates);
          this.vueCanvas.fillStyle = '#555'; 
          this.vueCanvas.fill();
          this.vueCanvas.strokeStyle = '#666'
          this.vueCanvas.stroke();
           
         pathGenerator.pointRadius(2.5);
         this.vueCanvas.lineWidth = 0.1;
         
          this.vueCanvas.globalAlpha = 0.6;
           
          this.ggDataResources.forEach(p => {
            if (!p.show) return;
            this.vueCanvas.beginPath(); 
            let facetPoints;  
             facetPoints = this.gangGangs.filter(r => r.dataResourceName == p.dr);
             this.vueCanvas.fillStyle = p.col;
             pathGenerator({type:"Feature",geometry: {type:"MultiPoint","coordinates": facetPoints.map(f => [f.decimalLongitude, f.decimalLatitude])}});
             this.vueCanvas.fill();
           })
        },

        buildGgDataResources(){
          const ggDataResources = this.facetData(this.gangGangs,"dataResourceName")
          const topTenColours = ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#eeee44"];
          let resources = topTenColours.map((c,i) => { 
              return {dr:ggDataResources[i].value, col:c, count: ggDataResources[i].items.length, show:true}
            });
          this.ggDataResources = resources;
        },

        toggleShowResource(dr){
          dr.show = !dr.show;
          this.buildCanvasMap(1600,1200);
        },

        tlPosition(year){
          // convert year to % for position
          return 100 * (year - this.tlYears[0])/(this.tlYears[1] - this.tlYears[0]) + '%'
        },

        facetData(data,field){ // util function
          let facets = {};
          data.forEach(d => {
                  if (!d[field]) return;
                  if (facets.hasOwnProperty(d[field])){
                          facets[d[field]].items.push(d);
                  } else {
                          facets[d[field]] = {value: d[field], items: [d]};
                  }
          })
          let facet_array = [];
          for (const key in facets){
                  facet_array.push(facets[key])
          }
          facet_array.sort((a,b) => b.items.length - a.items.length)
          return facet_array;
        }
      },

      mounted() {
        this.loadDataResources();
        this.buildGgDataResources();
        var c = document.getElementById("ggMap");
        var ctx = c.getContext("2d");    
        this.vueCanvas = ctx;
        this.vueCanvas.scale(2,2)
        this.buildCanvasMap(1600,1200);
      },

    }



</script>

<style>

  span.sample-query{
    text-decoration: underline;
    color:var(--ala-orange);
    cursor:pointer;
  }

  .data-table-wrapper{
    
    position:relative;
    
  }

  .data-table-wrapper table tbody{
    font-size:80%;
    width:100%;
    max-height:350px;
    overflow-y: scroll;
    display: block;
  }

  .data-table-wrapper table th{
    position:sticky;
    border-bottom: 1px solid #212121;
    top:0;
    background: white;
    text-align: left;
    z-index:1;
  }



  .data-table-wrapper table td{
    position:relative;
  }

  .data-table-wrapper table tfoot tr{
    position:sticky;
    bottom:0;
  }

  .data-table-bar{
    height:95%;
    background-color: var(--ala-ocean-quarter); 
    position:absolute;
    z-index:-1;
  }

  .data-table-wrapper table td .tick{
    position:absolute;
    font-size:0.65rem;
    color:var(--ala-darkgrey);
  }
  
/*  .data-wrapper{
    width:100%; 
    display:flex; 
    flex-direction:row; 
    flex-wrap:wrap; 
    align-content:flex-start;
  }

  .data-bar{
  display: inline-block;
  height:18px;
  float:left;
  background-color:lightblue;
  padding: 0 0 0 2px;
  margin:1px 2px 1px 0;
  font-size:9px;
  line-height: 1.1em;
  cursor:pointer;
  min-width:3px;
  position:relative;
  white-space: normal;

  }*/


/*  .dr-bar:hover{
    background-color: var(--ala-light-orange) ;
  }

  .dr-bar:hover .label{
    display: inline-flex;
  }

  .dr-bar .inner-wrapper{
    width:100%;
    height:100%;
    text-overflow: ellipsis;
    overflow:hidden;
  }

  .dr-bar .label{
    display:none;
    position:absolute;
    z-index:1;
    left:100%;
    top:0%;
    background-color: white;
    border:1px solid #eee;
    font-size:9px;
    min-width:120px;
    line-height: 1.1em;
    padding:1px;
  }*/

  /* timeMap */

  .drTimeline{
    margin-top: 1rem;
    height:450px;
/*    overflow-y: scroll;*/
/*    overflow-x: clip;*/
  }

.tlrow{
  position:relative;
  height:18px;
  width:100%;
  margin:0;
  padding:0;
  border-top:0.5px solid #ddd;
}

.tlrow .rowlabel{
  font-size:12px;
  position:absolute;
  left:0.25em;
  z-index:1;
  width:50%;
   white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity:0.6;
}

.tlcell{
  position:absolute;
  height:100%;
  width:0.8%;
  background-color: lightblue;
}

.tlcell.tick{
  background-color: transparent;
/*  border-left:1px solid black;*/
/*  padding-left:2px;*/
  font-size:0.65rem;
  margin-top: 0.5rem;
  color:var(--ala-darkgrey);

}

/* ggMap */
.ggMapWrap{

   position:relative;
}

#ggMap{
  max-width:800px;
  width:100%;

}

.ggMapSelect{
  display: inline-block;
  margin:0.2rem;
  padding:0.2rem 0.2rem 0.1rem 0.2rem;
/*  border: 1px solid var(--ala-concrete);*/
  z-index:1;
  position:relative;
  background-color: var(--ala-concrete);
  border:1px solid #aaa;
  font-size: 80%;
  cursor: pointer;
  user-select: none;
  opacity:0.35;

/*  color:white;*/
}

.ggMapSelect.show{
  opacity:1.0;
}

.ggMapSelect .chip{
  width:1rem;
  height:1rem;
  display: inline-block;
}

/* ganggang word cloud */


.ggCloud{
  line-height:1.1em;
  display:flex;
  align-items: center;
  flex-wrap: wrap;
  background-color: #f2f2f2;
  padding:1em;

}

.ggCloud button{
  margin:0px;
  cursor:pointer;
  border:0;
}

.ggCloud button.focus{
  color:var(--ala-orange);
}

.ggCloud button:hover{
  text-decoration: underline;
}

.ggComment{
  font-size:80%; 
  width:100%; 
  margin:9px 0; 
  display:inline-block;
  overflow-x: hidden;
}



</style>
<!-- <style lang="scss" src="~/style/style.scss"/> -->
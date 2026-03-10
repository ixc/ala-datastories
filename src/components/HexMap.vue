

<template>
  <main id="map" ref="mapcontainer">

    <l-map ref="map" :zoom="zoom" :center="mapCenter" :useGlobalLeaflet="false" @ready="mapReady" @update:bounds="boundsUpdated" @update:center="centerUpdated" :options="mapOptions" @zoomstart="mapZoomStart" @zoomend="mapZoomEnd" :detectRetina="true">
      <l-control-zoom position="topright"  ></l-control-zoom>
      <l-tile-layer :url="baseLayer.url"
                    layer-type="base"
                    :name="baseLayer.name"></l-tile-layer>
      <l-wms-tile-layer v-if="queryLoaded"
            :key="wmsLayer.name"
            :url="hexBaseUrl"
            :visible="wmsLayer.visible"
            :name="wmsLayer.name"
            :layers="wmsLayer.layers"
            format="image/jpeg"
            layer-type="base"
            :detectRetina="true">
      </l-wms-tile-layer>

    <!-- search area circle -->
      <l-circle ref="circle" :lat-lng="localCenter" :radius="filterRadiusMeters" :color="'#c44d34'" :fill="false" :weight=2 :dashArray="'5 10'"/>

    <!-- sample markers -->
      <l-marker v-for="o in obs" :lat-lng="[o.decimalLatitude,o.decimalLongitude]" :options="{riseOnHover:true}" @click="clickMarker(o.uuid)" :key="o.uuid" :z-index-offset="bounceMarkerId==o.uuid ? 30 : 0">
        <l-icon
          :icon-size="[21,28]"
          :icon-anchor="[10.5,28]"
          :shadow-size="[30,9]"
          :shadow-anchor="[15,4]"
          :popup-anchor="[0,-30]"
          :icon-url="`${siteRoot}/markers/${o.speciesGroup.toLowerCase()}-marker${focusMarkerId==o.uuid||bounceMarkerId==o.uuid?'-focus':''}.png`"
          :shadow-url="`${siteRoot}/markers/marker-shadow.png`"
          :class-name="`${bounceMarkerId==o.uuid ? 'focus': ''}`"
        />
        <l-popup :className="'hexMapPopup'" offset="[0,30]">
          <ObsTile :obs-data="o" popup="true" @show-modal="passModal"/>
        </l-popup>

      </l-marker>


      <Teleport to="#map .leaflet-container .leaflet-tooltip-pane">
          <div v-if="mapIsReady && mapIsZooming==false" id="radiusHandle" :style="{'left': dragHandlePos.x +'px', 'top': dragHandlePos.y + 'px'}" @touchstart="radiusHandleDragStart" @touchend="radiusHandleDragEnd" @mousedown="radiusHandleDragStart" @mouseup="radiusHandleDragEnd" @touchmove="dragThrottled">
              <img :src="`${siteRoot}/markers/drag-handle.png`" draggable="false">
          </div>
      </Teleport>

    </l-map>

      <button class="geoFocus" :class="{show: showRecenterButton}" @click="resetGeoFocus">
        <div class="ring"><p>search here</p></div>
        <!-- <p class="tip">or double-click map</p> -->
      </button>

  </main>
</template>


<script>
  import "leaflet/dist/leaflet.css";
  import { LMap, LTileLayer, LWmsTileLayer, LCircleMarker, LCircle, LPopup, LControlZoom, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";
  import ObsTile from '../components/ObsTile.vue';
  import {throttle} from '../throttle.js';
  import { extraFq } from '../apiConfig.js';

  export default {
    components: {
      LMap,
      LTileLayer,
      LWmsTileLayer,
      LCircleMarker,
      LMarker,
      LIcon,
      LCircle,
      LPopup,
      LControlZoom,
      ObsTile
    },

    props: {
      query: {
        type: String,
        required:true,
        default:"*"
      },
      recordCount:{
        type: Number,
        required:false,
        default:134343000
      },
      queryLoaded: false,
      obs:{
        type: Array,
        default:[]
      },
      zoom:{},
      filterCenter:{},
      filterRadius:{},

    },

    data() {
      return {
        map:null,
        mapCenter: {lat: -25.344490, lng: 131.035431},
        mapOptions: { attributionControl: false,
                      zoomControl:false,
                      doubleClickZoom:false,
                      scrollWheelZoom:false,
                      dragging:true},
        focusMarkerId:"",
        bounceMarkerId:"",
        baseLayer: {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
          name:"Carto Voyager"
        },
        bounds:null,
        radius:null,
        wmsLayer: {
          name: 'ALA Hex Map',
          layers:'',
          visible: true,
          format: 'image/png'
        },
        localCenter:this.filterCenter,
        localRadius: this.filterRadius,
        siteRoot: import.meta.env.BASE_URL,
        mapIsReady:false,
        mapIsZooming:false,
        dragHandlePos: {},
        dragHandleDiff:0,
        showRecenterButton:false

      }
    },

    computed:{
      hexBaseUrl(){ // build the base URL for the hex map
        const base = 'https://api.ala.org.au/occurrences/mapping/wms/reflect?&q='
        const colstring = this.mapBins[0].col+","+this.mapBins[0].count+","+this.mapBins[1].col+","+this.mapBins[1].count+","+this.mapBins[2].col+","+this.mapBins[2].count+","+this.mapBins[3].col+","+this.mapBins[3].count+","+this.mapBins[4].col;
        const envString = encodeURIComponent("size:3;colormode:hexbin;color:"+colstring);
        const fqString = extraFq ? '&fq=' + encodeURIComponent(extraFq) : '';
        return encodeURI(base+this.query+"&outline=false&ENV="+envString) + fqString;
      },

      mapBins(){
        let maxcount = Math.sqrt(this.recordCount)*12; // scaling w square root of total records
        let roundcount = maxcount;
        if (maxcount > 1000) roundcount = Math.floor(maxcount/100)*100;
        if (maxcount > 10000) roundcount = Math.floor(maxcount/1000)*1000;
        const binCounts = [1000,100,10,1,1].map(c => Math.floor(roundcount/c)); //scale down w maxcount
        const binColours= ["4Cffc557","72fcad54","99f99650","BFf57e4d","FFf26649"]
        // NB these colours are AARRGGBB, need to transform to be CSS hex
        return binCounts.map((c,i) => { return {col: binColours[i], csscol: '#'+ binColours[i].substring(2,8)+binColours[i].substring(0,2), count:c}})
      },
      radiusMeters(){
        return this.radius*1000;
      },
      filterRadiusMeters(){
        return this.localRadius*1000;
      }
    },


    methods: {
          mapReady (){
            this.$emit('mapready')
            this.bounds = this.$refs.map.leafletObject.getBounds();
            this.$refs.map.leafletObject.on("zoom", this.updateHandlePos);
            this.fitRadiusBounds();
            this.mapIsReady = true;
          },

          fitRadiusBounds(){
              let posEast = this.destinationFromPoint(this.localCenter,270,this.filterRadiusMeters);
              let posNorth = this.destinationFromPoint(this.localCenter,0,this.filterRadiusMeters);
              let posWest = this.destinationFromPoint(this.localCenter,90,this.filterRadiusMeters);
              let posSouth = this.destinationFromPoint(this.localCenter,180,this.filterRadiusMeters);
              let bounds = [[posNorth.lat,posEast.lng],[posSouth.lat,posWest.lng]]
              this.$refs.map.leafletObject.fitBounds(bounds, {paddingBottomRight: [0,80]})
          },

          clickMarker(id){
            if (this.focusMarkerId == id){
              this.focusMarkerId = "";
            } else {
              this.focusMarkerId = id;
            }
            if (this.bounceMarkerId) this.bounceMarkerId = ""
            this.$forceUpdate();
          },

          bounceMarker(id){
            this.bounceMarkerId = id;
            if (this.focusMarkerId) this.focusMarkerId = ""
            this.$forceUpdate();
          },

          passModal(obs){ // pass modal click up to App.vue
              this.$emit('showModal',obs)
          },

          centerUpdated (center) {
            this.mapCenter = center;
            this.radius = this.getViewRadius();
            this.checkRecenterButton();
            //this.updateHandlePos();
          },

          updateHandlePos(){
            //console.log("updating handle pos")
            let pos = this.destinationFromPoint(this.localCenter,90,this.filterRadiusMeters);
            this.dragHandlePos = this.$refs.map.leafletObject.latLngToLayerPoint(pos);
          },

          boundsUpdated (bounds) {
            this.bounds = bounds;
            this.radius = this.getViewRadius();
            this.checkRecenterButton();
            this.updateHandlePos();
          },

          resetGeoFocus(evt){
            let clickpos = this.relativeCoordsParent(evt);
            let clickLatLng = this.$refs.map.leafletObject.containerPointToLatLng([clickpos.x, clickpos.y ]);
            this.localCenter = clickLatLng;
            this.localRadius = this.getViewRadius();
            this.$emit("setGeoFocus", {lat: clickLatLng.lat, lon: clickLatLng.lng, radius: this.localRadius })
          },

          checkRecenterButton(){
            // calculate radius of the 20px recenter button in map meters
            let buttonRadius = this.$refs.map.leafletObject.distance(
              this.$refs.map.leafletObject.containerPointToLatLng([0, 0]),
              this.$refs.map.leafletObject.containerPointToLatLng([0, 20])
              );

            let mapCenterToFilterCenter = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.filterCenter.lat ,this.filterCenter.lng)*1000;
            if (mapCenterToFilterCenter > this.filterRadiusMeters + buttonRadius) {
              this.showRecenterButton = true;
              //this.$emit('updateRecenterButton',true)
            } else {
              this.showRecenterButton = false;
              //this.$emit('updateRecenterButton',false)
            }
          },

          getViewRadius(){
            // generate a radius based on the current map extent
            let halfh = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.bounds._northEast.lat ,this.mapCenter.lng);
            let halfw = this.getDistanceFromLatLonInKm(this.mapCenter.lat,this.mapCenter.lng, this.mapCenter.lat ,this.bounds._northEast.lng)
            let mindist = Math.min(halfh,halfw)
            return mindist * 0.7;
          },

          getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
            var dLon = this.deg2rad(lon2-lon1);
            var a =
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in km
            return d;
          },

          deg2rad(deg) {
            return deg * (Math.PI/180)
          },

          relativeCoordsParent ( event ) {
            var bounds = this.$refs.mapcontainer.getBoundingClientRect();
            var x = event.clientX - bounds.left;
            var y = event.clientY - bounds.top;
            return {x: x, y: y};
          },

          radiusHandleDragStart(evt){
            //console.log("start drag")
            this.$refs.map.leafletObject.dragging.disable();
            let pointerx = evt.clientX ? evt.clientX : evt.touches[0].clientX;
            let dx = pointerx - evt.target.offsetParent.offsetLeft;
            this.dragHandleDiff = dx - 18; // account for handle width
            this.$refs.mapcontainer.addEventListener("mousemove", this.dragThrottled);
            this.$refs.mapcontainer.addEventListener("mouseup", this.radiusHandleDragEnd);
          },

          radiusHandleDragEnd(evt){
            //console.log("end drag")
            this.$refs.map.leafletObject.dragging.enable();
            this.$refs.mapcontainer.removeEventListener("mousemove", this.dragThrottled);
            this.$refs.mapcontainer.removeEventListener("mouseup", this.radiusHandleDragEnd);
            this.$emit("setGeoFocus", {lat: this.localCenter.lat, lon: this.localCenter.lng, radius: this.localRadius })
            this.checkRecenterButton();
          },

          radiusHandleDragging(evt){
            // console.log("dragging")
            let pointerx = evt.clientX ? evt.clientX : evt.touches[0].clientX;
            this.dragHandlePos.x = pointerx - this.dragHandleDiff;
            let handleLatLon = this.$refs.map.leafletObject.layerPointToLatLng([this.dragHandlePos.x, this.dragHandlePos.y])
            this.localRadius = this.getDistanceFromLatLonInKm(this.localCenter.lat,this.localCenter.lng,this.localCenter.lat,handleLatLon.lng)
          },

          mapZoomStart(){
            //console.log("zoom start")
            this.mapIsZooming = true;
          },

          mapZoomEnd(){
           // console.log("zoom end")
            this.mapIsZooming = false;
          },




          destinationFromPoint(latlng, heading, distance) {
              heading = (heading + 360) % 360;
              var rad = Math.PI / 180,
                  radInv = 180 / Math.PI,
                  R = 6378137, // approximation of Earth's radius
                  lon1 = latlng.lng * rad,
                  lat1 = latlng.lat * rad,
                  rheading = heading * rad,
                  sinLat1 = Math.sin(lat1),
                  cosLat1 = Math.cos(lat1),
                  cosDistR = Math.cos(distance / R),
                  sinDistR = Math.sin(distance / R),
                  lat2 = Math.asin(sinLat1 * cosDistR + cosLat1 *
                      sinDistR * Math.cos(rheading)),
                  lon2 = lon1 + Math.atan2(Math.sin(rheading) * sinDistR *
                      cosLat1, cosDistR - sinLat1 * Math.sin(lat2));
              lon2 = lon2 * radInv;
              lon2 = lon2 > 180 ? lon2 - 360 : lon2 < -180 ? lon2 + 360 : lon2;
              //return this.map.latLng([lat2 * radInv, lon2]);
              return {lat:lat2 * radInv,lng:lon2}
          }
    },

    watch: {
      // update counts for the map bins; pass to App.vue
      hexBaseUrl(){
        this.$emit('updateBins',this.mapBins)
      },

      'localCenter.lng'(){
        this.checkRecenterButton();
        this.updateHandlePos();
      },

      'localCenter.lat'(){
        this.checkRecenterButton();
        this.updateHandlePos();
      }
    },

    created(){
      // create throttled version of the drag handler for improved smoothness
      this.dragThrottled = throttle(this.radiusHandleDragging,50)
    },

    mounted(){
      this.$nextTick(() => {
        this.map = this.$refs.map.leafletObject;
      })

    }


  };

</script>


<style>

  #map{
    height: 100%;
    width: 100%;
  }

  .leaflet-popup-content-wrapper{
    padding:0.25em;
  }

  .leaflet-marker-icon.focus{
    z-index:99999999;
    animation: marker-bounce;
    animation-duration: 0.5s;
    animation-iteration-count: 1;
  }

  @keyframes marker-bounce{
    0% {top:0px}
    30% {top:-12px}
    45% {top:-15px}
    50% {top:-16px}
    55% {top:-15px}
    70% {top:-12px}
    100% {top:0px}
  }

  #radiusHandle{
    width:36px;
    height:25px;
    position:absolute;
    z-index:1000;
    margin-top:-12.5px;
    margin-left:-18px;
    cursor:pointer;
/*    background-color: white;*/
    border-radius:10px;
  }

  #radiusHandle img{
    width:100%;
    height:100%;
/*    pointer-events: none;*/
  }

    button.geoFocus{
    background:none;
    border:none;

    margin:0 0.25rem;
    cursor:pointer;
    position:absolute;
    top:calc(50% - 20px - 45px);
    left:calc(50% - 20px);
    padding:0;
    z-index:9999;
    display: none;
    opacity:0.8;
  }

  button.geoFocus.show{
    display: block;
  }

  button.geoFocus.show:hover{
    opacity:1.0;

  }

  button.geoFocus .ring{
    width:40px;
    height:40px;
    border-radius: 50%;
    border: 2px dashed var(--ala-orange);
    margin:0.2rem;
    position:relative;


  }

  button.geoFocus .ring p{
    font-size: 0.6rem;
    font-weight: 400;
    text-align: center;
    margin-top:11px;
    line-height: 1.0em;
  }

  button.geoFocus:hover .ring p{
    font-weight: 600;
  }

</style>

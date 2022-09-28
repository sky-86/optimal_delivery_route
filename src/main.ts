import './styles.css'
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";

import Search from "@arcgis/core/widgets/Search";
import Graphic from "@arcgis/core/Graphic";
import * as route from "@arcgis/core/rest/route";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";

function initMap() {
  esriConfig.apiKey = import.meta.env.VITE_API_KEY; 

  const map = new Map({
    basemap: "streets-vector"
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-118.244, 34.052],
    zoom: 12
  });

  const search = new Search({
    view: view,
    container: "searchDiv"
  });

  search.on("select-result", function(event) {
    console.log(view.graphics.length);
    if (view.graphics.length === 1) {
      addGraphic(event.result);
    } else if (view.graphics.length === 2) {
      addGraphic(event.result);
    } else if (view.graphics.length === 3) {
      addGraphic(event.result);
      getRoute()
    } else {
      view.graphics.removeAll();
      addGraphic(event.result);
    }
  });

  view.when(() => {
    console.log("Map is loaded");
  })

  function addGraphic(result) {
    const symbol = {
      type: "simple-marker",
      color: "black",
      size: "8px"
    };

    const graphic = new Graphic({
      symbol: symbol,
      geometry: result.feature.geometry
    });
    view.graphics.add(graphic);
  }

  function getRoute() {
    console.log("finding best route");
    const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: view.graphics.toArray()
      }),
      //findBestSequence: true
    });

    route.solve(routeUrl, routeParams)
      .then(function(data) {
        data.routeResults.forEach(function(result) {
          result.route.symbol = {
            type: "simple-line",
            color: [5, 150, 255],
            width: 3
          };
          view.graphics.add(result.route);
        });
      })
      .catch(function(error){
          console.log(error);
      })
  }
}

initMap();

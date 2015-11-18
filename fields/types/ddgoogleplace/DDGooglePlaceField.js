var React = require('react'),
	Field = require('../Field'),
	map,
	googlePlaceService;

function initializeGooglePlaces () {
	var pyrmont = new google.maps.LatLng(0,0);
	map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 15
    });

  googlePlaceService = new google.maps.places.PlacesService(map);
}


function searchGooglePlaces(value, callback) {
	//value = encodeURIComponent(value);
	var latLng = new google.maps.LatLng(0,0);
	var request = {
	    query: value
	  };
  	if(!googlePlaceService)
  		initializeGooglePlaces();
	
	googlePlaceService.textSearch(request, callback);

}


module.exports = Field.create({

	debug : require('debug')('google'),

	displayName: 'Goole Place Search',
	
	searchGooglePlacesButtonClicked: function(event) {
		var value = this.refs.googleplacesinput.getDOMNode().value;
		var self = this;
		searchGooglePlaces(value, function(result){
			
			var formattedPlaces = [];
			if(result.length > 0){
				for(var i=0;i<result.length;i++) {
					formattedPlaces.push(<li onClick={self.placeSelected} data-places-index={i}>{result[i].name} {result[i].formatted_address}</li>)
				}
			} else {
				formattedPlaces.push((<li>No results found for that query!</li>))
			}

			self.setState({
				'formattedPlaces' : formattedPlaces,
				'places' : result
			})
		})

	},

	placeSelected : function(event) {
		var selectedPlaceIndex = event.currentTarget.attributes['data-places-index'].value;
		var selectedPlace = {
			formatted_address : this.state.places[parseInt(selectedPlaceIndex)].formatted_address,
			name : this.state.places[parseInt(selectedPlaceIndex)].name,
			place : this.state.places[parseInt(selectedPlaceIndex)],
			place_id : this.state.places[parseInt(selectedPlaceIndex)].place_id
		};
		this.setState({
			'selectedPlace' : selectedPlace
		});

	},

	getInitialState : function() {

		return {
			places : [],
			selectedPlace : {
				name : "",
				formatted_address : ""
			}
		}

	},

	componentWillMount : function() {

		var gpObj = this.props.values[this.props.path]

		if(typeof gpObj!='undefined'){
			this.setState({
				selectedPlace : {
						'name' : gpObj.item_title || "",
						'formatted_address' : gpObj.item_location_short || "",
						'place_id' : gpObj.item_source_reference_id || ""
					}
			});
		}
	},

	renderField : function() {
		
		var itemsListStyle = {
			 'height':'300px',
			 'overflow-y':'scroll',
			 'float':'left'
		};
		var hiddenInput = {
			'display':'none'
		}

		return (
			<div className="row">
				<div className="col-sm-2 location-field-label">
					<label className="text-muted">Google Places Search</label>
				</div>
				<div className="col-sm-10 col-md-7 col-lg-6 location-field-controls">
					<input type="text" name="googlePlacesSearch" ref="googleplacesinput" className="form-control" />
					<button type="button" className="btn btn-default" onClick={this.searchGooglePlacesButtonClicked}>Search</button>
				</div>
				<div className="col-sm-10 col-md-7 col-lg-6"> 
					<label className="text-muted">Selected Item</label>
					<span> {this.state.selectedPlace.name} {this.state.selectedPlace.formatted_address} </span>
					<input type="hidden" name="selectedPlace" value={this.state.selectedPlace.place_id} ref="selectedPlace" className="form-control" />
					<input type="hidden" name="itemTitle" value={this.state.selectedPlace.name} ref="selectedPlace" className="form-control" />
					<input type="hidden" name="itemLocationShort" value={this.state.selectedPlace.formatted_address} ref="selectedPlace" className="form-control" />
				</div>
				
				<div style={itemsListStyle}>
					<ul className="google-places-items-list">
						{ this.state.formattedPlaces }
					</ul>
				</div>
			</div>
		)

	}
	
});


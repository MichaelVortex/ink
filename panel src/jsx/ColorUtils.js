﻿//INK// Licence: GPL <http://www.gnu.org/licenses/gpl.html>//------------------------------------------------------------------------------// This program is free software: you can redistribute it and/or modify// it under the terms of the GNU General Public License as published by// the Free Software Foundation, either version 3 of the License, or// (at your option) any later version.// // This program is distributed in the hope that it will be useful,// but WITHOUT ANY WARRANTY; without even the implied warranty of// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the// GNU General Public License for more details.// // You should have received a copy of the GNU General Public License// along with this program.  If not, see <http://www.gnu.org/licenses/>.//------------------------------------------------------------------------------var ColorUtils = {	//Object 1 is OVER Object 2.    blendRGBAColors:function( rgba1, rgba2 )     {    	var blendRgba = {};		//calculate new alpha		var blendprimaryAlpha   = Math.max( rgba1.alpha, rgba2.alpha );		var blendsecondaryAlpha = Math.min( rgba1.alpha, rgba2.alpha );		blendRgba.alpha = blendprimaryAlpha + blendsecondaryAlpha * ( 1 - blendprimaryAlpha );		//calculate RGB blend		blendRgba.red   = ColorUtils.blendRGBAComponent(rgba1.red, rgba2.red, rgba1.alpha, rgba2.alpha, blendRgba.alpha );		blendRgba.green = ColorUtils.blendRGBAComponent(rgba1.green, rgba2.green, rgba1.alpha, rgba2.alpha, blendRgba.alpha );		blendRgba.blue  = ColorUtils.blendRGBAComponent(rgba1.blue, rgba2.blue, rgba1.alpha, rgba2.alpha, blendRgba.alpha );		return blendRgba;    },    //Important: A is the element OVER B    blendRGBAComponent:function( ca, cb, aa, ab, ba )     {    	var bc;		if ( aa == 1 ) {			bc = ca;		}		else {			bc = ( ca * aa + cb * ab * ( 1 - aa ) ) / ba;		}		return bc;    },    //get RGBA value at a point between 0 and 1.    getGradientRGBAPoint:function( sRgba, eRgba, pointA, pointPos )     {		var pointRGBA   = {};		pointRGBA.red   = ColorUtils.getGradientPointComponentByPos( sRgba.red, eRgba.red, pointPos );		pointRGBA.green = ColorUtils.getGradientPointComponentByPos( sRgba.green, eRgba.green, pointPos );		pointRGBA.blue  = ColorUtils.getGradientPointComponentByPos( sRgba.blue, eRgba.blue, pointPos );		pointRGBA.alpha = pointA;		return pointRGBA;	},	//giving that start component is at 0 and end component is at 1.	getGradientPointComponentByPos:function(sc,ec,pointPos) 	{		//component at point		var pointC = 0;		//qt of component that is changing from 0 to 1.		var cRange = Math.abs( ec - sc );		//component increase at point		var pointCI = cRange * pointPos;		if ( sc > ec ) {			pointC = sc - pointCI;		}		else if ( sc < ec ) {			pointC = sc + pointCI;		}		else if ( sc == ec ) {			pointC = sc;		}		return pointC;	},	/*	 * RGB object to css string	 */	RGBtoString : function( r, g, b ) 	{		return( "rgb(" + Math.round( r ) + "," + Math.round( g ) + "," + Math.round( b ) + ");" );	},	/*	 * RGBA object to css string	 */	RGBAtoString : function( r, g, b, a ) 	{		return( "rgba(" + Math.round( r ) + "," + Math.round( g ) + "," + Math.round( b ) + "," + ( Math.round( a ) / 100 ) + ");" );	},		/*	 * RGB to #	 */	rgbToHex:function(r, g, b) 	{		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);	},	/*	 * # to RGB	 */	hexToRgb:function(hex) 	{	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {	        return r + r + g + g + b + b;	    });	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);	    return result ? {	        r: parseInt(result[1], 16),	        g: parseInt(result[2], 16),	        b: parseInt(result[3], 16)	    } : null;	},	//calculate average alpha between stops[i].alpha (internal, css stop rgba alpha)	//and gradient fill fx opacity (external, main fx alpha. 0-100)	averageGradientInOutAlpha:function( stops, mainOpacity )	{		for ( var i = 0; i < stops.length; i++ )		{			var stopAverageAlpha   = Math.round( ( ( stops[i].alpha * 100 ) * mainOpacity ) / 100 ) / 100;			stops[i].alpha         = stopAverageAlpha;		}			return stops;	},	//merge PS color stops and transparency stops in a single, rgba color stops array.	mergeGradientCTStops:function( cStops, tStops ) 	{		//array to be returned.		var stops  = [];		//private functions.		//search into cStop or tStop wheter we 		//have a stop in this particular location.		function searchCStopByLocation( location ) {			var arrID = -1;			for ( var i = 0; i < cStops.length; i++ )			{					if ( convertGradientPSLocation(location) == convertGradientPSLocation(cStops[i].location) ) {					arrID = i;					break;				}			}			return arrID;		}		function searchTStopByLocation( location ) {			var arrID = -1;			for ( var i = 0; i < tStops.length; i++ )			{				if ( convertGradientPSLocation(location) == convertGradientPSLocation(tStops[i].location) ) {					arrID = i;					break;				}				}			return arrID;		}		//search for a transparency stop 'on the left' of a point location.		function searchForLeftTStop( location ) 		{			var leftID = -1;			for ( var i = 0; i < tStops.length; i++ )			{				if ( convertGradientPSLocation(tStops[i].location) < convertGradientPSLocation(location) )				{					leftID = i;				}				else 				{					break;				}					}			return leftID;		}		//search for a transparency stop 'on the right' of a point location.		function searchForRightTStop( location ) 		{			var rightID = -1;			for ( var i = (tStops.length-1); i >= 0; i-- )			{				if ( convertGradientPSLocation(tStops[i].location) > convertGradientPSLocation(location) )				{					rightID = i;				}				else 				{					break;				}					}			return rightID;		}		//search for a color stop 'on the left' of a point location.		function searchForLeftCStop( location ) 		{			var leftID = -1;			for ( var i = 0; i < cStops.length; i++ )			{				if ( convertGradientPSLocation(cStops[i].location) < convertGradientPSLocation(location) )				{					leftID = i;				}				else 				{					break;				}					}			return leftID;		}		//search for a color stop 'on the right' of a point location.		function searchForRightCStop( location ) 		{			var rightID = -1;			for ( var i = (cStops.length-1); i >= 0; i-- )			{				if ( convertGradientPSLocation(cStops[i].location) > convertGradientPSLocation(location) )				{					rightID = i;				}				else 				{					break;				}					}			return rightID;		}		//convert PS gradient location to % location		function convertGradientPSLocation( location )		{			return ( Math.round( ( location / 4096 ) * 100 ) );		}				//when a colorstop does not have a matching transparency stop, we manually create it in the cStop location.		function createCStopAlpha( cStopID ) 		{			var myAlpha = 0;			var leftTstopID = searchForLeftTStop( cStops[cStopID].location );			var rightTstopID = searchForRightTStop( cStops[cStopID].location );			if ( leftTstopID != -1 && rightTstopID != -1 ) 			{				//case .1				var relRange = convertGradientPSLocation(tStops[rightTstopID].location) - convertGradientPSLocation(tStops[leftTstopID].location);				var relPos   = convertGradientPSLocation(cStops[cStopID].location) - convertGradientPSLocation(tStops[leftTstopID].location);     								//return a number between 0 and 1 that im going to use to calculate the mid point alpha.				var posRatio = ( relPos / relRange ) * 1;				myAlpha      = ColorUtils.getGradientPointComponentByPos(tStops[leftTstopID].opacity,tStops[rightTstopID].opacity,posRatio);			}			else if ( leftTstopID == -1 && rightTstopID != -1 ) 			{				//case .2				myAlpha = tStops[rightTstopID].opacity;			}			else if ( leftTstopID != -1 && rightTstopID == -1 ) 			{				//case .3				myAlpha = tStops[leftTstopID].opacity;			}			return myAlpha;		}		//when a tranparencyStop does not have a matching color stop, we manually create it in the tStop location.		function createTStopRGB( tStopID ) 		{			var myRGB = {};			var leftCstopID = searchForLeftCStop( tStops[tStopID].location );			var rightCstopID = searchForRightCStop( tStops[tStopID].location );			if ( leftCstopID != -1 && rightCstopID != -1 ) 			{				//case .1				var relRange = convertGradientPSLocation(cStops[rightCstopID].location) - convertGradientPSLocation(cStops[leftCstopID].location);				var relPos   = convertGradientPSLocation(tStops[tStopID].location) - convertGradientPSLocation(cStops[leftCstopID].location);				//return a number between 0 and 1 that im going to use to calculate the mid point rgb				var posRatio = ( relPos / relRange ) * 1;				myRGB.red    = ColorUtils.getGradientPointComponentByPos(cStops[leftCstopID].solidColor.rgb.red, cStops[rightCstopID].solidColor.rgb.red, posRatio);				myRGB.green  = ColorUtils.getGradientPointComponentByPos(cStops[leftCstopID].solidColor.rgb.green, cStops[rightCstopID].solidColor.rgb.green, posRatio);				myRGB.blue   = ColorUtils.getGradientPointComponentByPos(cStops[leftCstopID].solidColor.rgb.blue , cStops[rightCstopID].solidColor.rgb.blue , posRatio);			}			else if ( leftCstopID == -1 && rightCstopID != -1 ) 			{				//case .2				myRGB = cStops[rightCstopID].solidColor.rgb;			}			else if ( leftCstopID != -1 && rightCstopID == -1 ) 			{				//case .3				myRGB = cStops[leftCstopID].solidColor.rgb;			}			return myRGB;		}		//push merged stop into return array		function storeStop( red, green, blue, alpha, location ) 		{			stops.push( { red:red, green:green, blue:blue, alpha:alpha, location:location } );		}		var locationMatchingID = -1;		for ( var i = 0; i < cStops.length; i++ ) 		{			locationMatchingID = searchTStopByLocation( cStops[i].location );			//alpha value for this colorStop (a.k.a tranparencyStop.)			var cStopAlpha;			//colorStop without matching transparencyStop			if ( locationMatchingID == -1 ) 			{				cStopAlpha = createCStopAlpha( i );			}			else 			{				cStopAlpha = tStops[locationMatchingID].opacity;			}			storeStop( Math.round( cStops[i].solidColor.rgb.red ),					   Math.round( cStops[i].solidColor.rgb.green ),					   Math.round( cStops[i].solidColor.rgb.blue ),					   ( Math.round(cStopAlpha) / 100),					   convertGradientPSLocation(cStops[i].location) );		}		for ( var i = 0; i < tStops.length; i++ ) 		{			locationMatchingID = searchCStopByLocation( tStops[i].location );			//tStop without matching cStop			if ( locationMatchingID == -1 ) 			{				var tStopRGB = createTStopRGB( i );				storeStop( Math.round( tStopRGB.red ),						   Math.round( tStopRGB.green ),						   Math.round( tStopRGB.blue ),						   ( Math.round(tStops[i].opacity) / 100),						   convertGradientPSLocation(tStops[i].location) );			}			else 			{				//there is a matching color stop.				//this stop has been already add in the color stops loop.				//...			}		}		//resort stops by position since there might be some shuffling.		stops.sort(function(obj1, obj2) 		{			return obj1.location - obj2.location;		});		return stops;	}};
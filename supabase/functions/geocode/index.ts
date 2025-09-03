import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
  country_code?: string;
}

interface PhotonResult {
  features: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      name: string;
      country: string;
      countrycode: string;
    };
  }>;
}

const priorityCountries = ['de', 'at', 'ch'];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const results: GeocodeResult[] = [];

    // Try Photon API first (Komoot's geocoding service)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`;
      const photonResponse = await fetch(photonUrl);
      
      if (photonResponse.ok) {
        const photonData: PhotonResult = await photonResponse.json();
        
        const photonResults = photonData.features.map(feature => ({
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          display_name: feature.properties.name,
          country_code: feature.properties.countrycode?.toLowerCase()
        }));
        
        results.push(...photonResults);
      }
    } catch (error) {
      console.log('Photon API error:', error);
    }

    // If no results from Photon, try Nominatim
    if (results.length === 0) {
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`;
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'Dating-Ideas-App/1.0'
          }
        });
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          
          const nominatimResults = nominatimData.map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name,
            country_code: item.address?.country_code?.toLowerCase()
          }));
          
          results.push(...nominatimResults);
        }
      } catch (error) {
        console.log('Nominatim API error:', error);
      }
    }

    // Sort results by priority countries
    const sortedResults = results.sort((a, b) => {
      const aIndex = priorityCountries.indexOf(a.country_code || '');
      const bIndex = priorityCountries.indexOf(b.country_code || '');
      
      // Priority countries first
      if (aIndex !== -1 && bIndex === -1) return -1;
      if (aIndex === -1 && bIndex !== -1) return 1;
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      
      // Then alphabetical
      return a.display_name.localeCompare(b.display_name);
    });

    return new Response(
      JSON.stringify({ results: sortedResults.slice(0, 5) }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
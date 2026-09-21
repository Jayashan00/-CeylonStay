import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import SearchBar from '../components/SearchBar.jsx'
import HotelCard from '../components/HotelCard.jsx'
import SriLankaMap from '../components/SriLankaMap.jsx'
import Loader from '../components/Loader.jsx'
import { useSiteSettings } from '../context/SiteSettingsContext.jsx'

const HERO_SLIDES=[
 {url:'https://images.pexels.com/photos/28838276/pexels-photo-28838276.jpeg?auto=compress&cs=tinysrgb&w=1920',caption:'Sigiriya Rock Fortress'},
 {url:'https://images.pexels.com/photos/30581907/pexels-photo-30581907.jpeg?auto=compress&cs=tinysrgb&w=1920',caption:'Nine Arches Bridge, Ella'},
 {url:'https://images.pexels.com/photos/29644514/pexels-photo-29644514.jpeg?auto=compress&cs=tinysrgb&w=1920',caption:'Mirissa Beach'},
 {url:'https://images.pexels.com/photos/14041994/pexels-photo-14041994.jpeg?auto=compress&cs=tinysrgb&w=1920',caption:'Temple of the Tooth, Kandy'},
]
const REGIONS=[
 {name:'Colombo',tag:'City & culture',img:'https://images.pexels.com/photos/8910835/pexels-photo-8910835.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Galle',tag:'Fort & beaches',img:'https://images.pexels.com/photos/33224238/pexels-photo-33224238.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Kandy',tag:'Temples & heritage',img:'https://images.pexels.com/photos/14041994/pexels-photo-14041994.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Nuwara Eliya',tag:'Tea country',img:'https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Hambantota',tag:'Safari & coast',img:'https://images.pexels.com/photos/15883403/pexels-photo-15883403.jpeg?auto=compress&cs=tinysrgb&w=500'},
 {name:'Trincomalee',tag:'East coast diving',img:'https://images.pexels.com/photos/6437583/pexels-photo-6437583.jpeg?auto=compress&cs=tinysrgb&w=500'},
]
const TRUST=[
 {icon:'🔒',title:'Real-time availability',text:'No double-bookings — availability is checked live for your dates.'},
 {icon:'💬',title:'Direct with the hotel',text:'Your reservation goes directly to the property.'},
 {icon:'🇱🇰',title:'Sri Lanka, done right',text:'Built for local hotels, resorts, villas and homestays.'},
]
export default function Home(){
 const {settings}=useSiteSettings(); const [hotels,setHotels]=useState([]); const [loading,setLoading]=useState(true); const [slide,setSlide]=useState(0)
 useEffect(()=>{api.get('/hotels',{params:{sortBy:'rating'}}).then(r=>setHotels(r.data)).finally(()=>setLoading(false))},[])
 useEffect(()=>{const t=setInterval(()=>setSlide(s=>(s+1)%HERO_SLIDES.length),6500);return()=>clearInterval(t)},[])
 return <div>
  <section className="relative overflow-hidden min-h-[680px] sm:min-h-[620px] flex items-center">
   {HERO_SLIDES.map((s,i)=><div key={s.url} className={`absolute inset-0 transition-opacity duration-1000 ${i===slide?'opacity-100':'opacity-0'}`}><img src={settings.heroImageUrl && i===0 ? settings.heroImageUrl : s.url} alt={s.caption} className="w-full h-full object-cover"/></div>)}
   <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65"/>
   <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
    <div className="max-w-2xl"><span className="inline-flex text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-full bg-black/35 border border-white/20">🌴 Official Direct Booking Platform</span><h1 className="text-white font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-[1.08] mt-4 drop-shadow-lg">{settings.tagline}</h1><p className="text-white text-base sm:text-lg leading-7 mt-4 max-w-xl drop-shadow-md">{settings.heroDescription}</p></div>
    <div className="mt-7 sm:mt-8"><SearchBar/></div>
   </div>
  </section>
  <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 sm:-mt-10 relative z-20 mb-12"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{TRUST.map(p=><div key={p.title} className="card p-5 flex items-start gap-3 bg-white"><span className="text-2xl shrink-0">{p.icon}</span><div><p className="font-semibold">{p.title}</p><p className="text-sm text-slate-500 mt-1 leading-5">{p.text}</p></div></div>)}</div></section>
  <section className="max-w-7xl mx-auto px-4 sm:px-6"><h2 className="font-display font-bold text-2xl">Explore by region</h2><p className="text-slate-500 mt-1 mb-5">From ancient rock fortresses to palm-lined beaches — every corner of the island.</p><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">{REGIONS.map(d=><Link key={d.name} to={`/hotels?district=${encodeURIComponent(d.name)}`} className="relative rounded-xl overflow-hidden h-40 group card"><img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end p-3"><p className="text-white font-bold">{d.name}</p><p className="text-white/80 text-xs">{d.tag}</p></div></Link>)}</div></section>
  <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4"><h2 className="font-display font-bold text-2xl">All properties on the map</h2><Link to="/hotels?map=1" className="text-primary font-semibold text-sm">Open full map →</Link></div>{loading?<Loader/>:<SriLankaMap hotels={hotels} height="420px"/>}</section>
  <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 mb-16"><h2 className="font-display font-bold text-2xl">Top rated stays right now</h2><p className="text-slate-500 mt-1 mb-5">Loved by real guests, verified by real bookings.</p>{loading?<Loader/>:<div className="grid gap-4">{hotels.slice(0,6).map(h=><HotelCard key={h.id} hotel={h}/>)}</div>}{!loading&&!hotels.length&&<p className="text-slate-500 text-center py-10">No properties published yet — check back soon.</p>}</section>
 </div>
}

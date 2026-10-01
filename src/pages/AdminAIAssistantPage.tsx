import { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, Lightbulb, RefreshCw, Sparkles, WandSparkles } from 'lucide-react';
import { categoryNames } from '../data/products';
import { PageTitle } from '../features/admin/AdminShared';

type SuggestionKey = 'description' | 'shortDescription' | 'name' | 'category' | 'tags' | 'caption';
type Suggestion = { id: string; value: string };
type AssistantFields = { productName: string; category: string; productType: string; color: string; material: string; targetCustomer: string; features: string; existingDescription: string };
const initialFields: AssistantFields = { productName: '', category: 'Dresses', productType: '', color: '', material: '', targetCustomer: '', features: '', existingDescription: '' };
const actions: { key: SuggestionKey; label: string; title: string; icon: typeof Sparkles }[] = [
  { key: 'description', label: 'Generate product description', title: 'Product description', icon: WandSparkles },
  { key: 'shortDescription', label: 'Generate short description', title: 'Short description', icon: Sparkles },
  { key: 'name', label: 'Suggest product name', title: 'Name ideas', icon: Lightbulb },
  { key: 'category', label: 'Suggest category', title: 'Category suggestion', icon: Sparkles },
  { key: 'tags', label: 'Suggest tags', title: 'Product tags', icon: Sparkles },
  { key: 'caption', label: 'Generate social media caption', title: 'Social caption', icon: WandSparkles },
];

function buildMockSuggestions(key: SuggestionKey, fields: AssistantFields): string[] {
  const type = fields.productType.trim() || fields.category.replace(/s$/, '').toLowerCase();
  const color = fields.color.trim() || 'soft neutral';
  const material = fields.material.trim() || 'considered fabric';
  const features = fields.features.trim() || 'thoughtful details and an easy silhouette';
  const customer = fields.targetCustomer.trim() || 'the modern wardrobe';
  switch (key) {
    case 'name': return [`${color[0].toUpperCase()+color.slice(1)} Edit ${type}`, `The ${type} in ${color}`, `VERA ${type} No. 01`];
    case 'category': return [fields.category, 'Tops', 'Dresses'];
    case 'tags': return [`${color.toLowerCase()}, ${type.toLowerCase()}, everyday, considered, ${material.toLowerCase()}`, `slow fashion, versatile, ${type.toLowerCase()}, ${color.toLowerCase()}`, `new season, wardrobe essential, ${material.toLowerCase()}`];
    case 'shortDescription': return [`A ${color.toLowerCase()} ${type.toLowerCase()} in ${material.toLowerCase()}, made for ${customer}.`, `${features}. Thoughtfully made for your everyday.`];
    case 'caption': return [`Meet your new ${type.toLowerCase()} kind of everyday. Thoughtfully made, endlessly yours. #VERACLOTHING`, `${color} tones, considered details, and a little room to feel like yourself. Discover the ${type.toLowerCase()}.`];
    default: return [
      `${fields.productName.trim() || `The ${color} ${type}`} is made in ${material.toLowerCase()} with ${features.toLowerCase()}. Designed for ${customer}, this considered piece brings ease to everyday dressing.`,
      `An easy new essential for ${customer}. Crafted in ${material.toLowerCase()}, with ${features.toLowerCase()} and a quietly confident feel.`,
    ];
  }
}

export function AdminAIAssistantPage() {
  const [fields,setFields]=useState(initialFields);
  const [suggestions,setSuggestions]=useState<Partial<Record<SuggestionKey,Suggestion[]>>>({});
  const [selected,setSelected]=useState<Partial<Record<SuggestionKey,string>>>({});
  const [editor,setEditor]=useState<Partial<Record<SuggestionKey,string>>>({});
  const [savedDrafts,setSavedDrafts]=useState<Suggestion[]>([]);
  const [copied,setCopied]=useState(false);
  const [busy,setBusy]=useState<SuggestionKey|null>(null);
  const categoryChoices=useMemo(()=>categoryNames.filter((category)=>category!=='All pieces'),[]);
  const update=(key:keyof AssistantFields,value:string)=>setFields((current)=>({...current,[key]:value}));
  const generate=(key:SuggestionKey)=>{
    setBusy(key);
    window.setTimeout(()=>{
      const values=buildMockSuggestions(key,fields).map((value,index)=>({id:`${Date.now()}-${index}`,value}));
      setSuggestions((current)=>({...current,[key]:values}));
      setSelected((current)=>({...current,[key]:undefined}));
      setEditor((current)=>({...current,[key]:values[0]?.value??''}));
      setBusy(null);
    },350);
  };
  const choose=(key:SuggestionKey,suggestion:Suggestion)=>{
    setSelected((current)=>({...current,[key]:suggestion.id}));
    setEditor((current)=>({...current,[key]:suggestion.value}));
  };
  const saveDraft=(key:SuggestionKey)=>{
    const text=editor[key]?.trim();
    if(!text)return;
    setSavedDrafts((current)=>[{id:`draft-${Date.now()}`,value:text},...current]);
  };
  const copyText=async(text:string)=>{try{await navigator.clipboard.writeText(text);setCopied(true);window.setTimeout(()=>setCopied(false),1200);}catch{setCopied(false);}};
  return <div className="admin-page ai-assistant-page"><PageTitle eyebrow="A thoughtful writing partner" title="AI Product Assistant" description="Explore ideas for your next piece. Your voice and final choices stay yours."/><div className="ai-scope-banner"><span><Sparkles size={17}/></span><p><strong>Suggestions are drafts only.</strong> Nothing is saved or published automatically. Choose an idea, edit it, and save it yourself when it feels right.</p></div><div className="ai-workflow"><span className="active">01 <small>Describe</small></span><i/><span>02 <small>Review</small></span><i/><span>03 <small>Choose & edit</small></span><i/><span>04 <small>Save draft</small></span></div>
    <div className="ai-layout"><section className="ai-input-panel"><div className="ai-panel-heading"><span className="ai-step">01</span><div><h2>Tell us about the piece</h2><p>A few details help shape more relevant suggestions.</p></div></div><div className="admin-form-grid"><label className="admin-field field-span-2"><span>Working product name</span><input value={fields.productName} onChange={(event)=>update('productName',event.target.value)} placeholder="e.g. The Solene Slip Dress"/></label><label className="admin-field"><span>Category</span><select value={fields.category} onChange={(event)=>update('category',event.target.value)}>{categoryChoices.map((category)=><option key={category}>{category}</option>)}</select></label><label className="admin-field"><span>Product type / style</span><input value={fields.productType} onChange={(event)=>update('productType',event.target.value)} placeholder="e.g. Bodycon, relaxed fit"/></label><label className="admin-field"><span>Color</span><input value={fields.color} onChange={(event)=>update('color',event.target.value)} placeholder="e.g. Black"/></label><label className="admin-field"><span>Material</span><input value={fields.material} onChange={(event)=>update('material',event.target.value)} placeholder="e.g. Stretch fabric"/></label><label className="admin-field field-span-2"><span>Target customer</span><input value={fields.targetCustomer} onChange={(event)=>update('targetCustomer',event.target.value)} placeholder="Who is this piece made for?"/></label><label className="admin-field field-span-2"><span>Key features</span><textarea rows={3} value={fields.features} onChange={(event)=>update('features',event.target.value)} placeholder="Details, fit, feel, or special qualities"/></label><label className="admin-field field-span-2"><span>Existing description <small>OPTIONAL</small></span><textarea rows={3} value={fields.existingDescription} onChange={(event)=>update('existingDescription',event.target.value)} placeholder="Give the assistant a starting point, if you have one"/></label></div><div className="ai-disclaimer"><Lightbulb size={15}/><span>Mock assistant responses for this preview. No AI service or external API is connected.</span></div></section>
      <section className="ai-results-panel"><div className="ai-panel-heading"><span className="ai-step ai-step-results">02</span><div><h2>What would you like to explore?</h2><p>Generate ideas to review. Regenerate any time.</p></div></div><div className="ai-action-grid">{actions.map(({key,label,icon:Icon})=><button key={key} className="ai-action-button" onClick={()=>generate(key)} disabled={busy!==null}><Icon size={16}/><span>{label}</span><ArrowRight size={14}/></button>)}</div>{actions.filter(({key})=>suggestions[key]).map(({key,title})=><section className="suggestion-section" key={key}><div className="suggestion-heading"><div><span className="admin-eyebrow">SUGGESTIONS</span><h3>{title}</h3></div><button className="admin-text-link" onClick={()=>generate(key)} disabled={busy!==null}><RefreshCw size={13}/> Regenerate</button></div><div className="suggestion-list">{suggestions[key]?.map((suggestion)=><button type="button" key={suggestion.id} className={`suggestion-option ${selected[key]===suggestion.id?'chosen':''}`} onClick={()=>choose(key,suggestion)}><span className="suggestion-radio">{selected[key]===suggestion.id&&<Check size={12}/>}</span><span>{suggestion.value}</span></button>)}</div><label className="admin-field suggestion-editor"><span>Edit before saving</span><textarea rows={3} value={editor[key]??''} onChange={(event)=>setEditor((current)=>({...current,[key]:event.target.value}))}/></label><div className="suggestion-actions"><button className="admin-outline-button" onClick={()=>copyText(editor[key]??'')}><Copy size={13}/>{copied?'Copied':'Copy text'}</button><button className="admin-primary-button" onClick={()=>saveDraft(key)} disabled={!editor[key]?.trim()}><Check size={14}/> Save as local draft</button></div></section>)}{!Object.keys(suggestions).length&&<div className="ai-empty-results"><div className="ai-empty-icon"><Sparkles size={23}/></div><strong>Your next idea starts here.</strong><span>Choose an action above to see some mock suggestions. You can review, edit, or ignore every idea.</span></div>}</section></div>
    {savedDrafts.length>0&&<section className="saved-drafts-panel"><div className="panel-header"><div><span className="admin-eyebrow">YOUR CHOICES</span><h2>Local drafts <span>{savedDrafts.length}</span></h2></div><span className="local-only-label">Not saved to products</span></div>{savedDrafts.map((draft,index)=><div className="saved-draft" key={draft.id}><span>{String(savedDrafts.length-index).padStart(2,'0')}</span><p>{draft.value}</p><button className="admin-text-link" onClick={()=>copyText(draft.value)}><Copy size={13}/> Copy</button></div>)}</section>}</div>;
}

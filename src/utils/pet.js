/** pet.js — the recipient's pet companion, built from what the sender said about their pet. */

export function buildPetConfig(phase2) {
  const { petAnimal, petName, petDescription } = phase2 || {}
  if (!petAnimal || ['none','no'].includes((petAnimal||'').toLowerCase())) return null

  const desc = (petDescription || '').toLowerCase()
  const animal = (petAnimal || '').toLowerCase()

  const colorMap = {
    black:'#2C2C2C', white:'#F5F5F5', brown:'#8B5E3C', golden:'#E8A85A',
    yellow:'#E8C45A', orange:'#E8803C', gray:'#9B9B9B', grey:'#9B9B9B',
    cream:'#F5DEB3', red:'#C8706E', tan:'#D2B48C', chocolate:'#6B3D2E',
    ginger:'#C87832', calico:'#E8A85A', tabby:'#9B8070',
  }
  const extractColor = (d) => {
    for (const [k,v] of Object.entries(colorMap)) if (d.includes(k)) return v
    return null
  }

  if (['dog','corgi','retriever','labrador','poodle','beagle'].some(w => animal.includes(w))) {
    return {
      type: 'dog', name: petName || 'Buddy',
      color: extractColor(desc) || '#E8A85A',
      earType: ['floppy','droopy','hang'].some(w => desc.includes(w)) ? 'floppy' : 'up',
    }
  }
  if (['cat','kitten'].some(w => animal.includes(w))) {
    return {
      type: 'cat', name: petName || 'Luna',
      bodyColor: extractColor(desc) || '#888888',
      patternType: desc.includes('tabby')||desc.includes('striped') ? 'tabby'
        : desc.includes('bicolor')||desc.includes('tuxedo')||desc.includes('white') ? 'bicolor' : 'solid',
      eyeColor: desc.includes('blue') ? '#4B9FD4'
        : desc.includes('green') ? '#4CAF50'
        : desc.includes('yellow')||desc.includes('amber') ? '#F5A623' : '#4CAF50',
    }
  }
  return { type: 'dog', name: petName || 'Buddy', color: '#E8A85A', earType: 'up' }
}

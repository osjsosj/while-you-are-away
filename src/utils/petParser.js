export function parsePetConfig(phase2) {
  const { petAnimal, petName, petDescription } = phase2 || {}

  if (
    !petAnimal ||
    petAnimal.toLowerCase() === 'none' ||
    petAnimal.toLowerCase() === 'no'
  ) {
    return null
  }

  const desc = (petDescription || '').toLowerCase()
  const animal = petAnimal.toLowerCase()

  if (
    animal.includes('dog') ||
    animal.includes('corgi') ||
    animal.includes('retriever') ||
    animal.includes('labrador') ||
    animal.includes('poodle') ||
    animal.includes('beagle')
  ) {
    const color = extractColor(desc) || '#E8A85A'
    const earType =
      desc.includes('floppy') ||
      desc.includes('droopy') ||
      desc.includes('hang')
        ? 'floppy'
        : 'up'

    return { type: 'dog', name: petName || 'Buddy', color, earType }
  }

  if (animal.includes('cat') || animal.includes('kitten')) {
    const bodyColor = extractColor(desc) || '#888888'
    const patternType =
      desc.includes('tabby') || desc.includes('striped')
        ? 'tabby'
        : desc.includes('bicolor') ||
            desc.includes('tuxedo') ||
            desc.includes('white')
          ? 'bicolor'
          : 'solid'
    const eyeColor = desc.includes('blue')
      ? '#4B9FD4'
      : desc.includes('green')
        ? '#4CAF50'
        : desc.includes('yellow') || desc.includes('amber')
          ? '#F5A623'
          : '#4CAF50'

    return {
      type: 'cat',
      name: petName || 'Luna',
      bodyColor,
      patternType,
      eyeColor,
    }
  }

  return { type: 'dog', name: petName || 'Buddy', color: '#E8A85A', earType: 'up' }
}

function extractColor(desc) {
  const colorMap = {
    black: '#2C2C2C',
    white: '#F5F5F5',
    brown: '#8B5E3C',
    golden: '#E8A85A',
    yellow: '#E8C45A',
    orange: '#E8803C',
    gray: '#9B9B9B',
    grey: '#9B9B9B',
    cream: '#F5DEB3',
    red: '#C8706E',
    tan: '#D2B48C',
    chocolate: '#6B3D2E',
    ginger: '#C87832',
    calico: '#E8A85A',
    tabby: '#9B8070',
  }
  for (const [key, val] of Object.entries(colorMap)) {
    if (desc.includes(key)) return val
  }
  return null
}

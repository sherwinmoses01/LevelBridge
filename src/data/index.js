import mathsData from './maths.json';
import englishData from './english.json';
import scienceData from './science.json';

export const SUBJECTS = {
  maths: {
    id: 'maths',
    name: 'Maths',
    icon: '📐',
    color: '#0284C7',
    tagline: 'Numbers, algebra & geometry',
    data: mathsData,
  },
  english: {
    id: 'english',
    name: 'English',
    icon: '📖',
    color: '#E11D48',
    tagline: 'Grammar, reading & vocabulary',
    data: englishData,
  },
  science: {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: '#059669',
    tagline: 'Living world, materials & forces',
    data: scienceData,
  },
};

export default SUBJECTS;

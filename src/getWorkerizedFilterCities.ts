// This exists for type-safety purposes.
// This is to avoid some issues https://github.com/kentcdodds/react-performance/issues/115

import { getItems } from "workerized-filter-cities";
import { getItems as filterCitiesGetItems } from './filter-cities';

const gI = getItems as typeof filterCitiesGetItems

export { gI as getItems };

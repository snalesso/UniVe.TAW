//namespace unive.taw.framework.game {

import { Ship } from './game';

export class Cacciatorpediniere extends Ship {
    public readonly size: number = 2;
}

export class Sottomarino extends Ship {
    public readonly size: number = 3;
}

export class Corazzata extends Ship {
    public readonly size: number = 4;
}

export class Portaerei extends Ship {
    public readonly size: number = 5;
}
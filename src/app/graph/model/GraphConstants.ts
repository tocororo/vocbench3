export class Size {
    public static Rectangle = {
        base: 100,
        height: 40
    };
    public static Square = {
        side: 70
    };
    public static Circle = {
        radius: 40
    }
    /**
     * Same as rectangle, but with corner "cutted"
     */
    public static Octagon = {
        base: Size.Rectangle.base,
        height: Size.Rectangle.height,
        cut: 10
    }

    public static Label = {
        base: 90,
        height: 40,
        cut: 10
    }
}

export class Constants {
    public static normalVectorMultiplier: number = 20;
    public static loopPathMultiplier: number = 20;
}
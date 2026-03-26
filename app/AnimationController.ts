import { Animated } from 'react-native';

export class AnimationController {
    scales: Animated.Value[];
    opacitys: Animated.Value[];
    showButton: boolean = true;
    showButtonFlag: boolean = false;
    lastScrollY: number = 0;

    constructor() {
        this.scales = [
            new Animated.Value(0), // 0 - pokemon cards
            new Animated.Value(0), // 1
            new Animated.Value(0), // 2
            new Animated.Value(0), // 3
            new Animated.Value(0), // 4
            new Animated.Value(1), // 5 - search result / showButton wrapper
            new Animated.Value(1),
        ];
        this.opacitys = [
            new Animated.Value(1), // 0 - outer wrapper + dark mode toggle
            new Animated.Value(1), // 1
            new Animated.Value(1), // 2
            new Animated.Value(1), // 3
            new Animated.Value(1), // 4
            new Animated.Value(1), // 5 - search result
        ];
    }

    opacityTransition(index: number, onToggleDark?: () => void) {
        if (index === 0) {
            Animated.sequence([
                Animated.timing(this.opacitys[0], { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.timing(this.opacitys[0], { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
            setTimeout(() => onToggleDark?.(), 150);

        } else if (index === 4) {
            Animated.sequence([
                Animated.timing(this.opacitys[4], { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(this.opacitys[4], { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();

        } else if (index === 5) {
            Animated.sequence([
                Animated.timing(this.scales[5], { toValue: 0, duration: 5, useNativeDriver: true }),
                Animated.timing(this.scales[5], { toValue: 1, duration: 500, useNativeDriver: true }),
            ]).start();
        }

        if (index === 6) {
            Animated.sequence([
                Animated.timing(this.scales[6], { toValue: 0, duration: 5, useNativeDriver: true }),
                Animated.timing(this.scales[6], { toValue: 1, duration: 500, useNativeDriver: true }),
            ]).start();
        }
    }

    scaleTransition(
        index: number,
        onShowButton: (val: boolean) => void,
        onShowButtonFlag: (val: boolean) => void,
    ) {
        if (index === 1 && this.showButton && !this.showButtonFlag) {
            this.showButtonFlag = true;
            onShowButtonFlag(true);
            setTimeout(() => {
                Animated.sequence([
                    Animated.timing(this.scales[5], { toValue: 1, duration: 5, useNativeDriver: true }),
                    Animated.timing(this.scales[5], { toValue: 0, duration: 200, useNativeDriver: true }),
                ]).start();
                setTimeout(() => {
                    this.showButton = false;
                    onShowButton(false);
                }, 130);
            }, 500);

        } else if (index === 2 && !this.showButton && this.showButtonFlag) {
            this.showButtonFlag = false;
            onShowButtonFlag(false);
            setTimeout(() => {
                Animated.sequence([
                    Animated.timing(this.scales[5], { toValue: 0, duration: 5, useNativeDriver: true }),
                    Animated.timing(this.scales[5], { toValue: 1, duration: 300, useNativeDriver: true }),
                ]).start();
                setTimeout(() => {
                    this.showButton = true;
                    onShowButton(true);
                }, 100);
            }, 500);
        }
    }

    handleScroll(
        nativeEvent: any,
        onLoadMore: () => void,
        loading: boolean,
        onShowButton: (val: boolean) => void,
        onShowButtonFlag: (val: boolean) => void,
    ) {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;

        if (isCloseToBottom && !loading) {
            onLoadMore();
        }

        const currentY = contentOffset.y;

        if (currentY > this.lastScrollY && currentY > 50) {
            this.scaleTransition(1, onShowButton, onShowButtonFlag);
        } else {
            this.scaleTransition(2, onShowButton, onShowButtonFlag);
        }

        this.lastScrollY = currentY;
    }

    startEntryAnimation() {
        Animated.stagger(
            200,
            this.scales.map(scale =>
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            )
        ).start();
    }
}
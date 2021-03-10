/**
 * FaceVector.defaults
 *
 * Numerical description of all the components of a standard Chernoff Face
 */
FaceVector.defaults = {
    // Head
    head_radius: {
        // id can be specified otherwise is taken head_radius
        min: 10,
        max: 100,
        step: 0.01,
        value: 30,
        label: 'Face radius'
    },
    head_scale_x: {
        min: 0.2,
        max: 2,
        step: 0.01,
        value: 0.5,
        label: 'Scale head horizontally'
    },
    head_scale_y: {
        min: 0.2,
        max: 2,
        step: 0.01,
        value: 1,
        label: 'Scale head vertically'
    },
    // Eye
    eye_height: {
        min: 0.1,
        max: 0.9,
        step: 0.01,
        value: 0.4,
        label: 'Eye height'
    },
    eye_radius: {
        min: 2,
        max: 30,
        step: 0.01,
        value: 5,
        label: 'Eye radius'
    },
    eye_spacing: {
        min: 0,
        max: 50,
        step: 0.01,
        value: 10,
        label: 'Eye spacing'
    },
    eye_scale_x: {
        min: 0.2,
        max: 2,
        step: 0.01,
        value: 1,
        label: 'Scale eyes horizontally'
    },
    eye_scale_y: {
        min: 0.2,
        max: 2,
        step: 0.01,
        value: 1,
        label: 'Scale eyes vertically'
    },
    // Pupil
    pupil_radius: {
        min: 1,
        max: 9,
        step: 0.01,
        value: 1,  //this.eye_radius;
        label: 'Pupil radius'
    },
    pupil_scale_x: {
        min: 0.2,
        max: 2,
        step: 0.01,
        value: 1,
        label: 'Scale pupils horizontally'
    },
    pupil_scale_y: {
        min: 0.2,
        max: 2,
        step: 0.01,
        value: 1,
        label: 'Scale pupils vertically'
    },
    // Eyebrow
    eyebrow_length: {
        min: 1,
        max: 30,
        step: 0.01,
        value: 10,
        label: 'Eyebrow length'
    },
    eyebrow_eyedistance: {
        min: 0.3,
        max: 10,
        step: 0.01,
        value: 3, // From the top of the eye
        label: 'Eyebrow from eye'
    },
    eyebrow_angle: {
        min: -2,
        max: 2,
        step: 0.01,
        value: -0.5,
        label: 'Eyebrow angle'
    },
    eyebrow_spacing: {
        min: 0,
        max: 20,
        step: 0.01,
        value: 5,
        label: 'Eyebrow spacing'
    },
    // Nose
    nose_height: {
        min: 0.4,
        max: 1,
        step: 0.01,
        value: 0.4,
        label: 'Nose height'
    },
    nose_length: {
        min: 0.2,
        max: 30,
        step: 0.01,
        value: 15,
        label: 'Nose length'
    },
    nose_width: {
        min: 0,
        max: 30,
        step: 0.01,
        value: 10,
        label: 'Nose width'
    },
    // Mouth
    mouth_height: {
        min: 0.2,
        max: 2,
        step: 0.01,
        value: 0.75,
        label: 'Mouth height'
    },
    mouth_width: {
        min: 2,
        max: 100,
        step: 0.01,
        value: 20,
        label: 'Mouth width'
    },
    mouth_top_y: {
        min: -10,
        max: 30,
        step: 0.01,
        value: -2,
        label: 'Upper lip'
    },
    mouth_bottom_y: {
        min: -10,
        max: 30,
        step: 0.01,
        value: 20,
        label: 'Lower lip'
    },

    scaleX: {
        min: 0,
        max: 20,
        step: 0.01,
        value: 0.2,
        label: 'Scale X'
    },

    scaleY: {
        min: 0,
        max: 20,
        step: 0.01,
        value: 0.2,
        label: 'Scale Y'
    },

    color: {
        min: 0,
        max: 20,
        step: 0.01,
        value: 0.2,
        label: 'color'
    },

    lineWidth: {
        min: 0,
        max: 20,
        step: 0.01,
        value: 0.2,
        label: 'lineWidth'
    }

};

// Compute range for each feature.
(function(defaults) {
    var key;
    for (key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            defaults[key].range = defaults[key].max - defaults[key].min;
        }
    }
})(FaceVector.defaults);

// Constructs a random face vector.
FaceVector.random = function() {
    console.log('*** FaceVector.random is deprecated. ' +
                'Use new FaceVector() instead.');
    return new FaceVector();
};

function FaceVector(faceVector, defaults) {
    var key;
    // Make random vector.
    if ('undefined' === typeof faceVector) {
        for (key in FaceVector.defaults) {
            if (FaceVector.defaults.hasOwnProperty(key)) {
                if (key === 'color') {
                    this.color = 'red';
                }
                else if (key === 'lineWidth') {
                    this.lineWidth = 1;
                }
                else if (key === 'scaleX') {
                    this.scaleX = 1;
                }
                else if (key === 'scaleY') {
                    this.scaleY = 1;
                }
                else {
                    this[key] = FaceVector.defaults[key].min +
                        Math.random() * FaceVector.defaults[key].range;
                }
            }
        }
    }
    // Mixin values.
    else if ('object' === typeof faceVector) {

        this.scaleX = faceVector.scaleX || 1;
        this.scaleY = faceVector.scaleY || 1;

        this.color = faceVector.color || 'green';
        this.lineWidth = faceVector.lineWidth || 1;

        defaults = defaults || FaceVector.defaults;

        // Merge on key.
        for (key in defaults) {
            if (defaults.hasOwnProperty(key)){
                if (faceVector.hasOwnProperty(key)) {
                    this[key] = faceVector[key];
                }
                else {
                    this[key] = defaults ? defaults[key] :
                        FaceVector.defaults[key].value;
                }
            }
        }
    }
    else {
        throw new TypeError('FaceVector constructor: faceVector must be ' +
                            'object or undefined.');
    }
}

module.exports = FaceVector;

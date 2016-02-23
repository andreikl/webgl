if(typeof Float32Array != 'undefined') {
    window.glMatrixArrayType = Float32Array;
} else if(typeof WebGLFloatArray != 'undefined') {
    window.glMatrixArrayType = WebGLFloatArray;
} else {
    window.glMatrixArrayType = Array;
}

export default {
    point3: {
        create (p) {
            var dest = new glMatrixArrayType(3);
            if(p) {
                dest[0] = p[0];
                dest[1] = p[1];
                dest[2] = p[2];
            }
            return dest;
        },
    },
    vec3: {
        create (vec) {
            var dest = new glMatrixArrayType(3);
            if(vec) {
                dest[0] = vec[0];
                dest[1] = vec[1];
                dest[2] = vec[2];
            }
            return dest;
        },
        add (vec, vec2, dest) {
            if (!dest || vec == dest) {
                vec[0] += vec2[0];
                vec[1] += vec2[1];
                vec[2] += vec2[2];
                return vec;
            }
            dest[0] = vec[0] + vec2[0];
            dest[1] = vec[1] + vec2[1];
            dest[2] = vec[2] + vec2[2];
            return dest;
        },
        subtract (vec, vec2, dest) {
            if (!dest || vec == dest) {
                vec[0] -= vec2[0];
                vec[1] -= vec2[1];
                vec[2] -= vec2[2];
                return vec;
            }
            dest[0] = vec[0] - vec2[0];
            dest[1] = vec[1] - vec2[1];
            dest[2] = vec[2] - vec2[2];
            return dest;
        },
        scale (vec, val, dest) {
            if (!dest || vec == dest) {
                vec[0] *= val;
                vec[1] *= val;
                vec[2] *= val;
                return vec;
            }
            dest[0] = vec[0] * val;
            dest[1] = vec[1] * val;
            dest[2] = vec[2] * val;
            return dest;
        },
        dot (vec1, vec2) {
            return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
        }
    },
    mat4: {
        create (mat) {
            var dest = new glMatrixArrayType(16);
            if(mat) {
                dest[0] = mat[0];
                dest[1] = mat[1];
                dest[2] = mat[2];
                dest[3] = mat[3];
                dest[4] = mat[4];
                dest[5] = mat[5];
                dest[6] = mat[6];
                dest[7] = mat[7];
                dest[8] = mat[8];
                dest[9] = mat[9];
                dest[10] = mat[10];
                dest[11] = mat[11];
                dest[12] = mat[12];
                dest[13] = mat[13];
                dest[14] = mat[14];
                dest[15] = mat[15];
            }
            return dest;
        },

        identity (dest) {
            dest[0] = 1;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
            dest[4] = 0;
            dest[5] = 1;
            dest[6] = 0;
            dest[7] = 0;
            dest[8] = 0;
            dest[9] = 0;
            dest[10] = 1;
            dest[11] = 0;
            dest[12] = 0;
            dest[13] = 0;
            dest[14] = 0;
            dest[15] = 1;
            return dest;
        },

        multiplyVec3 (mat, vec, dest) {
            if (!dest) { 
                dest = vec;
            }

            var x = vec[0], y = vec[1], z = vec[2];
            
            dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
            dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
            dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
            
            return dest;
        },

        toInverseMat3 (mat, dest) {
            // Cache the matrix values (makes for huge speed increases!)
            var a00 = mat[0], a01 = mat[1], a02 = mat[2];
            var a10 = mat[4], a11 = mat[5], a12 = mat[6];
            var a20 = mat[8], a21 = mat[9], a22 = mat[10];
            
            var b01 = a22*a11-a12*a21;
            var b11 = -a22*a10+a12*a20;
            var b21 = a21*a10-a11*a20;
                    
            var d = a00*b01 + a01*b11 + a02*b21;
            if (!d) { return null; }
            var id = 1/d;
            
            if(!dest) { dest = mat3.create(); }
            
            dest[0] = b01*id;
            dest[1] = (-a22*a01 + a02*a21)*id;
            dest[2] = (a12*a01 - a02*a11)*id;
            dest[3] = b11*id;
            dest[4] = (a22*a00 - a02*a20)*id;
            dest[5] = (-a12*a00 + a02*a10)*id;
            dest[6] = b21*id;
            dest[7] = (-a21*a00 + a01*a20)*id;
            dest[8] = (a11*a00 - a01*a10)*id;
            
            return dest;
        },

        frustum (left, right, bottom, top, near, far, dest) {
            if(!dest) { dest = mat4.create(); }
            var rl = (right - left);
            var tb = (top - bottom);
            var fn = (far - near);
            dest[0] = (near*2) / rl;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
            dest[4] = 0;
            dest[5] = (near*2) / tb;
            dest[6] = 0;
            dest[7] = 0;
            dest[8] = (right + left) / rl;
            dest[9] = (top + bottom) / tb;
            dest[10] = -(far + near) / fn;
            dest[11] = -1;
            dest[12] = 0;
            dest[13] = 0;
            dest[14] = -(far*near*2) / fn;
            dest[15] = 0;
            return dest;
        },

        lookAt (eye, center, up, dest) {
            if(!dest) { dest = mat4.create(); }
            
            var eyex = eye[0],
                    eyey = eye[1],
                    eyez = eye[2],
                    upx = up[0],
                    upy = up[1],
                    upz = up[2],
                    centerx = center[0],
                    centery = center[1],
                    centerz = center[2];

            if (eyex == centerx && eyey == centery && eyez == centerz) {
                    return mat4.identity(dest);
            }
            
            var z0,z1,z2,x0,x1,x2,y0,y1,y2,len;
            
            //vec3.direction(eye, center, z);
            z0 = eyex - center[0];
            z1 = eyey - center[1];
            z2 = eyez - center[2];
            
            // normalize (no check needed for 0 because of early return)
            len = 1/Math.sqrt(z0*z0 + z1*z1 + z2*z2);
            z0 *= len;
            z1 *= len;
            z2 *= len;
            
            //vec3.normalize(vec3.cross(up, z, x));
            x0 = upy*z2 - upz*z1;
            x1 = upz*z0 - upx*z2;
            x2 = upx*z1 - upy*z0;
            len = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
            if (!len) {
                    x0 = 0;
                    x1 = 0;
                    x2 = 0;
            } else {
                    len = 1/len;
                    x0 *= len;
                    x1 *= len;
                    x2 *= len;
            };
            
            //vec3.normalize(vec3.cross(z, x, y));
            y0 = z1*x2 - z2*x1;
            y1 = z2*x0 - z0*x2;
            y2 = z0*x1 - z1*x0;
            
            len = Math.sqrt(y0*y0 + y1*y1 + y2*y2);
            if (!len) {
                    y0 = 0;
                    y1 = 0;
                    y2 = 0;
            } else {
                    len = 1/len;
                    y0 *= len;
                    y1 *= len;
                    y2 *= len;
            }
            
            dest[0] = x0;
            dest[1] = y0;
            dest[2] = z0;
            dest[3] = 0;
            dest[4] = x1;
            dest[5] = y1;
            dest[6] = z1;
            dest[7] = 0;
            dest[8] = x2;
            dest[9] = y2;
            dest[10] = z2;
            dest[11] = 0;
            dest[12] = -(x0*eyex + x1*eyey + x2*eyez);
            dest[13] = -(y0*eyex + y1*eyey + y2*eyez);
            dest[14] = -(z0*eyex + z1*eyey + z2*eyez);
            dest[15] = 1;
            
            return dest;
        }, 

        perspective (fovy, aspect, near, far, dest) {
            var top = near*Math.tan(fovy*Math.PI / 360.0);
            var right = top*aspect;
            return this.frustum(-right, right, -top, top, near, far, dest);
        }
    },
    mat3: {
        create (mat) {
            var dest = new glMatrixArrayType(9);
            if(mat) {
                    dest[0] = mat[0];
                    dest[1] = mat[1];
                    dest[2] = mat[2];
                    dest[3] = mat[3];
                    dest[4] = mat[4];
                    dest[5] = mat[5];
                    dest[6] = mat[6];
                    dest[7] = mat[7];
                    dest[8] = mat[8];
            }
            return dest;
        },
        identity (dest) {
            dest[0] = 1;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
            dest[4] = 1;
            dest[5] = 0;
            dest[6] = 0;
            dest[7] = 0;
            dest[8] = 1;
            return dest;
        },
        multiplyVec3 (mat, vec, dest) {
            if (!dest) {
                dest = vec;
            }

            var x = vec[0], y = vec[1], z = vec[2];
            
            dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
            dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
            dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
            
            return dest;
        }
    }
}

*************************************************************************
*									*
* SERVO_A7.ASM								*
*									*
* uses: Port A bit 7 as servo control signal				*
*	TOC1 interrupt used to generate positive-side (pulse width) and	*
*	negative-side (pulse interval) of control waveform		*
*									*
* defines:								*
* IC global "servo_a7_pulse" -- servo pulselength in 500 ns. units	*
* IC function "servo_a7_init(int enable)" -- call with 1 to enable	*
*						       0 to disable	*
* 									*
* Fred Martin								*
* fredm@media.mit.edu							*
* 12 September 1996							*
*									*
*************************************************************************

BASE	EQU	$1000	; register base

PORTA	EQU	$1000	; Port A data register
CFORC	EQU	$100B	; Timer Compare Force Register
OC1M	EQU	$100C	; Output Compare 1 Mask register
OC1D	EQU	$100D	; Output Compare 1 Data register
TCNT	EQU	$100E	; Timer Count Register
TOC1	EQU	$1016	; Timer Output Compare register 1
TMSK1	EQU	$1022	; main Timer interrupt Mask register 1
TFLG1	EQU	$1023	; main Timer interrupt Flag register 1
PACTL	EQU	$1026	; Pulse Accumulator Control register

TOC1INT	EQU	$E8	; Timer Output Compare 1 vector

SERVO_BIT EQU	$80	; PA7 bit
SERVO_PORT EQU	PORTA	; servo output port
PULSE_DEFAULT EQU 2560	; initial value when servo is turned on

	ORG	MAIN_START

* C variables
variable_servo_a7_pulse		FDB	0

* internal variables
servo_a7_pulse			FCB	0	; if 0, generate gap

subroutine_initialize_module:
	ldx	#$bf00

* install toc1 interrupt routine
	ldd	#servo_a7_int
	std	TOC1INT,X

	ldd	#PULSE_DEFAULT
	std	variable_servo_a7_pulse	; initialize servo period

	clrb				; run "servo_disable" and 
* 					; fall through 

*************************************************************************
subroutine_servo_a7_init:
	ldx	#BASE

	tstb
	beq	servo_disable
servo_enable
	bset	PACTL,X $80		; turn on PA7 as output
	bset	OC1M,X SERVO_BIT	; tell OC1 to control A7

* begin with positive-going pulse
	ldd	TCNT,X
	addd	variable_servo_a7_pulse
	std	TOC1,X			; set end of positive pulse
	
	bset	OC1D,X SERVO_BIT	; set output bit to turn on
	bset	CFORC,X SERVO_BIT	; force a match
	bclr	OC1D,X SERVO_BIT	; on next match, bit goes low
	bset	TFLG1,X SERVO_BIT	; clear interrupt flag
	bset	TMSK1,X SERVO_BIT	; enable TOC1 interrupt

	clr	servo_a7_pulse		; tell int routine to make gap
	
	rts

servo_disable
	bclr	PACTL,X $80		; disable servo output bit
	bclr	TMSK1,X SERVO_BIT	; disable TOC1 interrupt
	
	rts

*************************************************************************
servo_a7_int
	ldx	#BASE
	bclr	TFLG1,X $FF-SERVO_BIT	; clear interrupt flag

* if interrupt occured and bit is true, set up for falling edge	
	tst	servo_a7_pulse
	bne	setup_pulse
	
setup_gap
	ldd	TOC1,X			; get falling edge time
	addd	#40000			; 20 ms later
	subd	variable_servo_a7_pulse	; less length of pulse
	std	TOC1,X
	
	ldaa	#1
	staa	servo_a7_pulse		; next time make pulse

	rti

setup_pulse
	ldd	TOC1,X
	addd	variable_servo_a7_pulse
	std	TOC1,X			; set end of positive pulse
	
	bset	OC1D,X SERVO_BIT	; set output bit to turn on
	bset	CFORC,X SERVO_BIT	; force a match

	bclr	OC1D,X SERVO_BIT	; on next match, bit goes low

	clr	servo_a7_pulse		; tell int routine to make gap
	
	rti
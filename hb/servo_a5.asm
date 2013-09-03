*************************************************************************
*									*
* SERVO_A5.ASM								*
*									*
* uses: Port A bit 5 as servo control signal				*
*	TOC3 interrupt used to generate positive-side (pulse width) and	*
*	negative-side (pulse interval) of control waveform		*
*									*
* defines:								*
* IC global "servo_a5_pulse" -- servo pulselength in 500 ns. units	*
* IC function "servo_a5_init(int enable)" -- call with 1 to enable	*
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
TCNT	EQU	$100E	; Timer Count Register
TOC3	EQU	$101A	; Timer Output Compare register 3
TCTL1	EQU	$1020	; Timer Control register 1
TMSK1	EQU	$1022	; main Timer interrupt Mask register 1
TFLG1	EQU	$1023	; main Timer interrupt Flag register 1
PACTL	EQU	$1026	; Pulse Accumulator Control register

TOC3INT	EQU	$E4	; Timer Output Compare 3

SERVO_BIT EQU	$20	; PA5 bit
SERVO_PORT EQU	PORTA	; servo output port
PULSE_DEFAULT EQU 2560	; initial value when servo is turned on

	ORG	MAIN_START

* C variables
variable_servo_a5_pulse		FDB	0

* internal variables
servo_a5_pulse			FCB	0	; if 0, generate gap

subroutine_initialize_module:
	ldx	#$bf00

* install toc3 interrupt routine
	ldd	#servo_a5_int
	std	TOC3INT,X

	ldd	#PULSE_DEFAULT
	std	variable_servo_a5_pulse	; initialize servo period

	clrb				; run "servo_disable" and 
* 					; fall through 

*************************************************************************
subroutine_servo_a5_init:
	ldx	#BASE

	tstb
	beq	servo_disable
servo_enable

* begin with positive-going pulse
	ldd	TCNT,X
	addd	variable_servo_a5_pulse
	std	TOC3,X			; set end of positive pulse
	
	bset	TCTL1,X $30		; on match, TOC3 goes high	
	bset	CFORC,X SERVO_BIT	; force a match
	bclr	TCTL1,X $10		; on match, TOC3 goes low
	bset	TFLG1,X SERVO_BIT	; clear interrupt flag
	bset	TMSK1,X SERVO_BIT	; enable TOC3 interrupt

	clr	servo_a5_pulse		; tell int routine to make gap
	
	rts

servo_disable
	bclr	TMSK1,X SERVO_BIT	; disable TOC3 interrupt
	
	rts

*************************************************************************
servo_a5_int
	ldx	#BASE
	bclr	TFLG1,X $FF-SERVO_BIT	; clear interrupt flag

* if interrupt occured and bit is true, set up for falling edge	
	tst	servo_a5_pulse
	bne	setup_pulse
	
setup_gap
	ldd	TOC3,X			; get falling edge time
	addd	#40000			; 20 ms later
	subd	variable_servo_a5_pulse	; less length of pulse
	std	TOC3,X
	
	ldaa	#1
	staa	servo_a5_pulse		; next time make pulse

	rti

setup_pulse
	ldd	TOC3,X
	addd	variable_servo_a5_pulse
	std	TOC3,X			; set end of positive pulse
	
	bset	TCTL1,X $30		; on match, TOC3 goes high	
	bset	CFORC,X SERVO_BIT	; force a match
	bclr	TCTL1,X $10		; on match, TOC3 goes low

	clr	servo_a5_pulse		; tell int routine to make gap
	
	rti
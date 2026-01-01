/**
 * @template TInput
 * @template TOutput
 */
export class IUseCase {
    /**
     * @param {TInput} input
     * @returns {Promise<TOutput>}
     */
    async execute(input) {
        throw new Error('Method not implemented')
    }
}
